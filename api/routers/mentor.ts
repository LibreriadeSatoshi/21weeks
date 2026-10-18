import { z } from "zod";
import { generateObject, generateText, stepCountIs } from "ai";
import { createRouter, publicQuery } from "../middleware";
import { PROJECTS, LEARNING_RESOURCES, type Locale, type Profile } from "@contracts/types";
import { kimiGw, defaultModelId } from "../ai/provider";
import { classifyAiError, isRetryableAiError } from "../ai/ai-client";
import { mentorSystemPrompt, profileSummary } from "../ai/mentor";
import { knowledgeTools } from "../ai/knowledge";
import { repairJsonObject } from "../ai/structured-output";

const profileSchema = z.object({
  role: z.enum(["developer", "researcher"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  languages: z.array(z.string()),
  tracks: z.array(z.string()),
  hoursPerWeek: z.number().min(1).max(60),
});

const issueSchema = z.object({
  id: z.string(),
  number: z.number(),
  title: z.string(),
  url: z.string(),
  labels: z.array(z.string()),
  comments: z.number(),
  body: z.string(),
});

// issue comment cache (10 min): signals like "there is already a PR", "it's taken", etc.
const commentsCache = new Map<string, { at: number; data: string[] }>();

// Background plan generation jobs (see startPlanJob).
// IN THE DATABASE, not in memory: the production platform is serverless
// (Function Compute) and each request may land on a different instance;
// an in-memory Map would make polling fail to find the job. MySQL is
// the only state shared between instances.
import { getDb } from "../queries/connection";
import { planJobs as planJobsTable } from "@db/schema";
import { eq, sql } from "drizzle-orm";

type PlanResult = Awaited<ReturnType<typeof buildPlan>>;

// The serverless platform does not run `db:push` on deploy, so the
// table is created lazily the first time it is touched. CREATE TABLE IF NOT
// EXISTS is idempotent; the cached promise avoids repeating it per request.
let tableReady: Promise<void> | null = null;
function ensurePlanJobsTable(): Promise<void> {
  if (!tableReady) {
    tableReady = (async () => {
      await getDb().execute(sql`
        CREATE TABLE IF NOT EXISTS plan_jobs (
          id VARCHAR(36) PRIMARY KEY,
          status ENUM('running','done','error') NOT NULL DEFAULT 'running',
          stage VARCHAR(40) NULL,
          plan MEDIUMTEXT,
          error TEXT,
          createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      // The production DB (Aliyun) may default to utf8 (3 bytes), which
      // rejects emojis and any 4-byte UTF-8 in the plan JSON with
      // "Incorrect string value". CONVERT TO is idempotent and also fixes
      // a table already created with the wrong charset.
      await getDb().execute(
        sql`ALTER TABLE plan_jobs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      // the stage column may be missing in tables created by old versions;
      // MySQL does not support ADD COLUMN IF NOT EXISTS, so we ignore the
      // duplicate column error and propagate any other.
      await getDb()
        .execute(sql`ALTER TABLE plan_jobs ADD COLUMN stage VARCHAR(40) NULL`)
        .catch((e) => {
          const dbErrors = [e, (e as { cause?: unknown }).cause] as {
            code?: string;
            errno?: number;
            message?: string;
          }[];
          const isDuplicate = dbErrors.some(
            (error) =>
              error?.code === "ER_DUP_FIELDNAME" ||
              error?.errno === 1060 ||
              error?.message?.includes("Duplicate column"),
          );
          if (!isDuplicate) throw e;
        });
      console.log("[plan-job] plan_jobs table verified/created (utf8mb4)");
    })().catch((e) => {
      tableReady = null; // allow a retry on the next call
      throw e;
    });
  }
  return tableReady;
}

async function jobCreate(id: string) {
  await ensurePlanJobsTable();
  await getDb().insert(planJobsTable).values({ id, status: "running" });
}
async function jobDone(id: string, plan: PlanResult) {
  const json = JSON.stringify(plan);
  try {
    await getDb()
      .update(planJobsTable)
      .set({ status: "done", plan: json })
      .where(eq(planJobsTable.id, id));
  } catch (err) {
    // fallback: if the column still rejects 4-byte UTF-8, we save the
    // plan without those characters (only affects emojis/exotic symbols)
    console.warn(`[plan-job ${id}] update failed, retrying without >BMP chars:`, err);
    const asciiSafe = json.replace(/[\u{10000}-\u{10FFFF}]/gu, "");
    await getDb()
      .update(planJobsTable)
      .set({ status: "done", plan: asciiSafe })
      .where(eq(planJobsTable.id, id));
  }
}
async function jobError(id: string, error: string) {
  await getDb()
    .update(planJobsTable)
    .set({ status: "error", error: error.slice(0, 1000) })
    .where(eq(planJobsTable.id, id));
}
// stage visible to the UI while the job runs (nothing sensitive: only
// generic step names that the frontend translates into friendly messages)
async function jobStage(id: string, stage: string) {
  await getDb().update(planJobsTable).set({ stage }).where(eq(planJobsTable.id, id));
}
async function jobGet(id: string) {
  await ensurePlanJobsTable();
  const rows = await getDb().select().from(planJobsTable).where(eq(planJobsTable.id, id)).limit(1);
  return rows[0] ?? null;
}

async function fetchRecentComments(issueId: string): Promise<string[]> {
  // GitHub only: id = github:owner/repo:number
  const parts = issueId.split(":");
  if (parts[0] !== "github" || parts.length !== 3) return [];
  const hit = commentsCache.get(issueId);
  if (hit && Date.now() - hit.at < 10 * 60 * 1000) return hit.data;
  try {
    const res = await fetch(
      `https://api.github.com/repos/${parts[1]}/issues/${parts[2]}/comments?per_page=5&direction=desc`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "21weeks-bitcoin-oss",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<{ user?: { login?: string }; body?: string }>;
    const comments = data
      .slice(0, 3)
      .map((c) => `${c.user?.login ?? "?"}: ${(c.body ?? "").replace(/\s+/g, " ").slice(0, 220)}`);
    commentsCache.set(issueId, { at: Date.now(), data: comments });
    return comments;
  } catch {
    return [];
  }
}

// If a comment mentions a PR ("#9421", "/pull/9421"), we resolve its
// actual state: open/merged/closed + last activity. That way the ranking tells
// "there is an active PR fixing it" apart from "there is an abandoned PR: room for you".
const prCache = new Map<string, { at: number; data: string }>();

async function resolveReferencedPRs(issueId: string, comments: string[]): Promise<string[]> {
  const parts = issueId.split(":");
  if (parts[0] !== "github" || parts.length !== 3) return [];
  const repo = parts[1];
  const refs = new Set<number>();
  for (const c of comments) {
    for (const m of c.matchAll(/(?:\/pull\/|#)(\d{2,6})/g)) refs.add(Number(m[1]));
  }
  const out: string[] = [];
  for (const num of [...refs].slice(0, 3)) {
    const key = `${repo}#${num}`;
    const hit = prCache.get(key);
    if (hit && Date.now() - hit.at < 10 * 60 * 1000) {
      out.push(hit.data);
      continue;
    }
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/pulls/${num}`, {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "21weeks-bitcoin-oss",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) continue;
      const pr = (await res.json()) as {
        title?: string;
        state?: string;
        merged?: boolean;
        updated_at?: string;
        comments?: number;
        review_comments?: number;
      };
      const summary = `PR #${num} "${(pr.title ?? "").slice(0, 80)}" — state: ${pr.merged ? "MERGED" : (pr.state ?? "?").toUpperCase()}, last activity: ${(pr.updated_at ?? "").slice(0, 10)}, ${pr.comments ?? 0} comments + ${pr.review_comments ?? 0} review comments`;
      prCache.set(key, { at: Date.now(), data: summary });
      out.push(summary);
    } catch {
      // no data: the comment is still there
    }
  }
  return out;
}

// Short retry for transient gateway errors (overload, 5xx, network
// drops). Only AiTransient is retried; terminal errors (quota exhausted,
// content rejected, misconfiguration) are propagated as is.
async function withAiRetry<T>(fn: () => Promise<T>, attempts = 2, delayMs = 4000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const raw = err as { text?: unknown; finishReason?: unknown };
      if (raw.text !== undefined || raw.finishReason !== undefined) {
        console.warn("[ai] structured output failed:", {
          finishReason: raw.finishReason,
          text: typeof raw.text === "string" ? raw.text.slice(0, 4000) : raw.text,
        });
      }
      const mapped = classifyAiError(err);
      if (!isRetryableAiError(mapped) || i === attempts) throw mapped;
      console.warn(`[ai] transient error (${mapped.message?.slice(0, 120)}), retry ${i + 1}/${attempts}`);
      await new Promise((r) => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

// Research phase: looks for primary sources and returns the full pool
// of verified resources (canonical + researched + curated courses).
async function researchResources(
  project: (typeof PROJECTS)[number],
  profile: Profile,
  issue: { title: string } | null | undefined,
): Promise<{ label: string; url: string }[]> {
  const canonicalLinks = [
    project.urls.repo,
    project.urls.contributing,
    project.urls.docs,
    project.urls.chat,
    project.urls.chatAlt,
  ].filter(Boolean) as string[];

  let researched: { label: string; url: string }[] = [];
  try {
    const research = await withAiRetry(async () =>
      generateText({
        model: kimiGw()(await defaultModelId()),
        tools: knowledgeTools,
        stopWhen: stepCountIs(5),
        prompt: `You are researching resources for a 21-week contributor onboarding plan for the open-source project ${project.name} (${project.urls.repo}).

Do 2-4 searches with searchBitcoinKnowledge / lookupSpec to find concrete, primary sources a new contributor should read: contributing guides, architecture docs, canonical PRs and precedents, relevant BIPs/BOLTs sections, mailing-list or Delving Bitcoin threads about this project's area.${issue ? ` The user's first issue is: ${issue.title} — find sources specifically about that topic.` : ""}

Then output ONLY a JSON array (no markdown fences) of up to 14 items:
[{"label": "short human title", "url": "exact URL from a tool result"}, ...]
Every URL must come verbatim from a tool result. No invented URLs.`,
        providerOptions: { "kimi-gw": { max_completion_tokens: 3000 } },
      }),
    );
    // 1) deterministic harvest: URLs straight from the tool results
    //    (immune to the model running out of tokens for the JSON)
    const seen = new Set<string>();
    for (const step of (research as { steps?: unknown[] }).steps ?? []) {
      const toolResults = (step as { toolResults?: unknown[] }).toolResults ?? [];
      for (const tr of toolResults) {
        const out = (tr as { result?: unknown; output?: unknown }).result ??
          (tr as { output?: unknown }).output;
        const hits = (out as { results?: { title?: string; url?: string }[] })?.results;
        if (!Array.isArray(hits)) continue;
        for (const h of hits) {
          const url = h?.url ?? "";
          if (!/^https?:\/\//.test(url) || seen.has(url)) continue;
          seen.add(url);
          researched.push({ label: (h.title ?? url).slice(0, 90), url });
        }
      }
    }
    // 2) fallback: parse the model's JSON
    if (researched.length === 0) {
      const match = research.text.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]) as { label: string; url: string }[];
        researched = parsed.filter(
          (r) => typeof r?.label === "string" && /^https?:\/\//.test(r?.url ?? ""),
        );
      }
    }
    researched = researched.slice(0, 14);
  } catch (e) {
    // if research fails, we continue with the canonical links only
    console.warn("[plan] research phase failed:", (e as Error)?.message ?? e);
  }
  console.log(`[plan] researched resources: ${researched.length}`);

  // Curated courses (Librería de Satoshi / Bitcoin Dev Project) that
  // overlap with the project's tracks and the user's level.
  // Exception: a COURSE on the project's subject counts as an on-ramp to the
  // protocol even if it targets a lower level; an advanced dev
  // getting into Cashu still benefits from the Cashu "beginner" course.
  const LEVEL_RANK: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
  const userRank = LEVEL_RANK[profile.level] ?? 2;
  const curated = LEARNING_RESOURCES.filter(
    (r) =>
      r.tracks.some((t) => project.tracks.includes(t)) &&
      (r.levels.includes(profile.level) ||
        (r.kind === "course" && r.levels.some((l) => (LEVEL_RANK[l] ?? 2) < userRank))),
  );

  return [
    ...canonicalLinks.map((u) => ({ label: u.replace(/^https?:\/\//, "").slice(0, 60), url: u })),
    ...researched,
    ...curated.map((c) => ({ label: `[course] ${c.title.en}`, url: c.url })),
  ];
}

export const mentorRouter = createRouter({
  recommendIssues: publicQuery
    .input(
      z.object({
        locale: z.enum(["es", "en"]),
        profile: profileSchema,
        projectId: z.string(),
        issues: z.array(issueSchema).max(25),
      }),
    )
    .mutation(async ({ input }) => {
      const project = PROJECTS.find((p) => p.id === input.projectId);
      if (!project || input.issues.length === 0) return { rankings: [] };
      const locale = input.locale as Locale;
      const langName = locale === "es" ? "Spanish" : "English";

      // Enrich with recent comments: they show whether an issue already has
      // an open PR ("would this be solved by #N?"), whether someone has claimed it
      // or whether the thread is a swamp; key signals before recommending it.
      const enriched = await Promise.all(
        input.issues.slice(0, 10).map(async (i) => {
          const comments = i.comments > 0 ? await fetchRecentComments(i.id) : [];
          const referencedPRs = comments.length ? await resolveReferencedPRs(i.id, comments) : [];
          return { issue: i, recentComments: comments, referencedPRs };
        }),
      );

      const issuesDigest = enriched
        .map(
          ({ issue: i, recentComments, referencedPRs }) =>
            `ID=${i.id}\n#${i.number} ${i.title}\nlabels: ${i.labels.join(", ")}\ncomments: ${i.comments}\nbody: ${i.body.slice(0, 350)}${
              recentComments.length
                ? `\nrecent comments:\n${recentComments.map((c) => `  - ${c}`).join("\n")}`
                : ""
            }${
              referencedPRs.length
                ? `\nreferenced PRs (verified status):\n${referencedPRs.map((p) => `  - ${p}`).join("\n")}`
                : ""
            }`,
        )
        .join("\n---\n");

      try {
        const { object } = await withAiRetry(async () =>
          generateObject({
          model: kimiGw()(await defaultModelId()),
          schema: z.object({
            rankings: z.array(
              z.object({
                issueId: z.string(),
                score: z.number().min(0).max(100),
                reason: z.string(),
              }),
            ),
          }),
          prompt: `${mentorSystemPrompt(locale, input.profile as Profile, project)}

Task: rank the following open issues from ${project.name} for THIS user, best first. Pick the top 5 maximum. For each, give a fit score (0-100) and a 2-3 sentence reason in ${langName}: why it fits their profile, what they will learn, and one thing to check before starting. Only use issue IDs from the list.

CRITICAL vetting rules — read the recent comments and the verified PR statuses carefully:
- If a comment suggests an existing PR might already solve it, check the verified status: MERGED or OPEN-with-recent-activity → penalize hard (score ≤ 30) and say so explicitly in the reason. OPEN-but-stale (no activity for ~4+ weeks) is a gray zone: a real opportunity only if the user is willing to first ask politely in the issue whether they can pick it up — reflect that in the score (40-60) and make the reason name the PR and its last activity date.
- If someone has claimed the issue or is actively working it (and no answer from maintainers about it being free), penalize and warn.
- If the thread shows maintainer disagreement or scope creep, warn that it's a swamp, not a first issue.

User profile:
${profileSummary(input.profile as Profile, locale)}

Issues:
${issuesDigest}`,
          providerOptions: { "kimi-gw": { max_completion_tokens: 2500 } },
          experimental_repairText: async ({ text }) => repairJsonObject(text),
          }),
        );
        return { rankings: object.rankings };
      } catch (err) {
        throw classifyAiError(err);
      }
    }),

  researchPlanResources: publicQuery
    .input(
      z.object({
        locale: z.enum(["es", "en"]),
        profile: profileSchema,
        projectId: z.string(),
        issue: issueSchema.nullish(),
      }),
    )
    .mutation(async ({ input }) => {
      const project = PROJECTS.find((p) => p.id === input.projectId);
      if (!project) throw new Error("unknown project");
      const pool = await researchResources(project, input.profile as Profile, input.issue);
      return { pool };
    }),

  generatePlan: publicQuery
    .input(
      z.object({
        locale: z.enum(["es", "en"]),
        profile: profileSchema,
        projectId: z.string(),
        issue: issueSchema.nullish(),
        pool: z.array(z.object({ label: z.string(), url: z.string() })).nullish(),
      }),
    )
    .mutation(async ({ input }) => {
      const project = PROJECTS.find((p) => p.id === input.projectId);
      if (!project) throw new Error("unknown project");
      const locale = input.locale as Locale;
      const langName = locale === "es" ? "Spanish" : "English";

      const issueBlock = input.issue
        ? `\nThe user has chosen this first issue to anchor the plan:\n#${input.issue.number} ${input.issue.title}\n${input.issue.url}\nlabels: ${input.issue.labels.join(", ")}\n${input.issue.body.slice(0, 400)}`
        : "";

      // The pool comes from the client (phase 1 already done in researchPlanResources);
      // if it is missing (direct call), we research here as a fallback.
      const resourcePool =
        input.pool && input.pool.length > 0
          ? input.pool
          : await researchResources(project, input.profile as Profile, input.issue);
      return { plan: await buildPlan(project, input, locale, langName, resourcePool, issueBlock) };
    }),

  // ---- Asynchronous generation with polling ------------------------------
  // The production proxy cuts long HTTP requests (~1 min), and a
  // plan takes 1-3 min. Solution: startPlanJob responds instantly with a
  // jobId and the job runs in the background on the server; the client
  // polls planJob every few seconds (millisecond requests) until
  // the status is "done" or "error". Jobs live in MySQL (auto-created
  // plan_jobs table) because the platform is serverless: each request
  // may land on a different instance and memory is not shared.
  startPlanJob: publicQuery
    .input(
      z.object({
        locale: z.enum(["es", "en"]),
        profile: profileSchema,
        projectId: z.string(),
        issue: issueSchema.nullish(),
      }),
    )
    .mutation(async ({ input }) => {
      const project = PROJECTS.find((p) => p.id === input.projectId);
      if (!project) throw new Error("unknown project");
      const jobId = crypto.randomUUID();
      await jobCreate(jobId);
      await jobStage(jobId, "researching").catch(() => {});
      console.log(`[plan-job ${jobId}] started (project ${input.projectId})`);
      // no await: the job runs in the background
      void (async () => {
        try {
          const locale = input.locale as Locale;
          const langName = locale === "es" ? "Spanish" : "English";
          const issueBlock = input.issue
            ? `\nThe user has chosen this first issue to anchor the plan:\n#${input.issue.number} ${input.issue.title}\n${input.issue.url}\nlabels: ${input.issue.labels.join(", ")}\n${input.issue.body.slice(0, 400)}`
            : "";
          const resourcePool = await researchResources(project, input.profile as Profile, input.issue);
          console.log(`[plan-job ${jobId}] research ready (${resourcePool.length} resources), generating…`);
          await jobStage(jobId, "writing").catch(() => {});
          const plan = await buildPlan(project, input, locale, langName, resourcePool, issueBlock);
          await jobStage(jobId, "done").catch(() => {});
          await jobDone(jobId, plan);
          console.log(`[plan-job ${jobId}] completed`);
        } catch (err) {
          const mapped = classifyAiError(err);
          // the root MySQL/Drizzle message is usually in the cause or the stack;
          // we dump it whole to the server logs so we are not left blind
          const cause = (err as { cause?: { message?: string } })?.cause?.message;
          const fullMsg = [mapped.message, cause].filter(Boolean).join(" | causa: ");
          console.error(`[plan-job ${jobId}] failed:`, fullMsg, err);
          await jobError(jobId, fullMsg || String(err)).catch(() => {});
        }
      })();
      return { jobId };
    }),

  planJob: publicQuery
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const job = await jobGet(input.jobId);
      if (!job) {
        console.warn(`[planJob] ${input.jobId} not found in DB`);
        return { status: "error" as const, error: "job not found" };
      }
      if (job.status === "done" && job.plan) {
        return { status: "done" as const, plan: JSON.parse(job.plan) as PlanResult };
      }
      if (job.status === "error") return { status: "error" as const, error: job.error ?? "unknown" };
      return { status: "running" as const, stage: job.stage ?? "starting" };
    }),
});

// Shared body of plan generation (used by generatePlan and by
// the startPlanJob background worker).
async function buildPlan(
  project: (typeof PROJECTS)[number],
  input: {
    profile: z.infer<typeof profileSchema>;
    hoursPerWeek?: number;
    issue?: z.infer<typeof issueSchema> | null;
  },
  locale: Locale,
  langName: string,
  resourcePool: { label: string; url: string }[],
  issueBlock: string,
) {
  const poolBlock = resourcePool.map((r) => `- ${r.label} :: ${r.url}`).join("\n");
  try {
    const planSchema = z.object({
          intro: z.string(),
          graduation: z.string(),
          weeks: z
            .array(
              z.object({
                week: z.number(),
                phase: z.string(),
                title: z.string(),
                objectives: z.array(z.string()).max(4),
                tasks: z.array(z.string()).max(5),
                resources: z
                  .array(z.object({ label: z.string(), url: z.string() }))
                  .max(3),
                outcome: z.string(),
              }),
            )
            .length(21),
        });

        const { object } = await withAiRetry(async () =>
          generateObject({
          model: kimiGw()(await defaultModelId()),
          schema: planSchema,
          prompt: `${mentorSystemPrompt(locale, input.profile as Profile, project)}

Task: design a realistic 21-week roadmap that takes this user from zero to recognized contributor of ${project.name} (${project.urls.repo}). Write EVERYTHING in ${langName}.

VERIFIED RESOURCE POOL — the ONLY URLs you may use in weekly "resources" (pick 1-3 per week, copy the URL verbatim; you may reuse them across weeks):
${poolBlock}

Structure the 21 weeks in phases, roughly:
- Weeks 1-3: environment setup, build from source, run tests, read contributing guide, lurk in community channels, understand review culture.
- Weeks 4-6: deep dive into the codebase area of their first issue; reproduce the issue; study related PRs; first trivial contributions (docs, tests, review comments on others' PRs).
- Weeks 7-10: work their first real issue end to end: discussion, implementation BY THEM, tests, PR, iterate on review feedback.
- Weeks 11-15: broaden: review others' PRs, pick a second (harder) issue, participate in community calls/IRC.
- Weeks 16-21: own a meaningful contribution area, mentor newer newcomers, establish reputation: the "you are now a contributor" graduation.

Rules:
- The plan must respect their availability of ${input.profile.hoursPerWeek} hours/week. Tasks must be concrete actions the USER does (read X file, run Y test, ask Z in the dev channel), never "the mentor will do".
- Resource labels should be short and specific (what the user will read there), never "Bitcoin Knowledge Base: …" — that site is the search tool, not a reading resource.
- Items prefixed [course] in the pool are curated courses (Librería de Satoshi, Spanish; Bitcoin Dev Project, English): place them in the EARLY weeks (1-6) where they fit the week's topic, at most one course per week, and label them in ${langName}. If a [course] teaches THIS project's own protocol or stack (e.g. a Cashu course for a Cashu project), always include it in weeks 1-4 as the structured ramp-up, even if it targets a lower level than the user.
- The project's official docs (its docs URL in the pool) are the primary "learn here" destination: assign them explicitly in weeks 1-3 as required reading, not just as an occasional link.
- Each week: phase (2-4 words), title (short), 2-4 objectives, 3-5 concrete tasks, 1-3 resources, one tangible outcome. Keep every objective/task/outcome under 14 words — concise beats verbose.
- intro: 2-3 sentences framing the journey. graduation: what "being a contributor" looks like at week 21 (3-4 sentences max).

User profile:
${profileSummary(input.profile as Profile, locale)}
${issueBlock}`,
          providerOptions: { "kimi-gw": { max_completion_tokens: 20000 } },
          experimental_repairText: async ({ text }) => repairJsonObject(text),
          }),
        );
        return {
          projectId: project.id,
          projectName: project.name,
          generatedAt: new Date().toISOString(),
          issueId: input.issue?.id,
          intro: object.intro,
          graduation: object.graduation,
          weeks: object.weeks,
        };
      } catch (err) {
        throw classifyAiError(err);
      }
}
