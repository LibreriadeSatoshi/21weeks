import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { PROJECTS } from "@contracts/types";
import { useI18n } from "@/i18n";
import { useAppState } from "@/state";
import { trpc } from "@/providers/trpc";
import {
  ArrowRight,
  ChatLines,
  Check,
  Download,
  Refresh,
  Upload,
  WarningTriangle,
} from "iconoir-react";
import {
  AiLabel,
  Choice,
  ExternalLink,
  Notice,
  MotifField,
  Progress,
  SectionHead,
} from "@/components/ismos";
import {
  buildPlanMarkdown,
  downloadMarkdown,
  parseImportedPlan,
} from "@/lib/planExport";

const FUNDING = [
  { label: "Librería de Satoshi", url: "https://libreriadesatoshi.com/" },
  { label: "Vinteum", url: "https://vinteum.org/" },
  { label: "Bitshala", url: "https://bitshala.org/fellowship/" },
  { label: "Btrust", url: "https://www.btrust.tech/grants" },
  { label: "bitcoindevs.xyz", url: "https://bitcoindevs.xyz/get-funded" },
  { label: "OpenSats", url: "https://opensats.org/apply" },
];

/** Cabecera del plan: bloque Ink a todo el ancho con el campo de motivo detrás
 *  de la etiqueta y el título (nunca texto corrido sobre el motivo). */
function PlanHero({ label, title }: { label: string; title: string }) {
  return (
    <section className="app-ink app-motif-block py-64 md:py-96">
      <MotifField />
      <div className="app-container flex flex-col gap-16">
        <p className="ism-label ism-label--on-color m-0">{label}</p>
        <h1 className="ism-t-display text-text-heading m-0 max-w-reading">
          {title}
        </h1>
      </div>
    </section>
  );
}

export default function PlanPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const {
    profile,
    projectId,
    pickedIssue,
    plan,
    setPlan,
    doneWeeks,
    toggleWeek,
    restoreAll,
  } = useAppState();
  const [aiError, setAiError] = useState(false);
  const [importMsg, setImportMsg] = useState<"ok" | "err" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const genTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const project = PROJECTS.find(p => p.id === projectId);

  const exportPlan = () => {
    if (!plan || !project) return;
    const md = buildPlanMarkdown(
      {
        profile,
        projectId,
        projectName: project.name,
        issue: pickedIssue,
        plan,
        doneWeeks,
        exportedAt: new Date().toISOString(),
      },
      locale
    );
    downloadMarkdown(`21weeks-${project.id}.md`, md);
  };

  const importPlan = async (file: File) => {
    const text = await file.text();
    const state = parseImportedPlan(text);
    if (!state) {
      setImportMsg("err");
      return;
    }
    restoreAll({
      profile: state.profile,
      projectId: state.projectId,
      issue: state.issue,
      plan: state.plan,
      doneWeeks: state.doneWeeks ?? [],
    });
    setImportMsg("ok");
  };

  const importControls = (
    <span className="inline-flex flex-wrap items-center gap-16">
      <button
        type="button"
        className="ism-btn ism-btn--secondary"
        onClick={() => fileRef.current?.click()}
      >
        <Upload width={20} height={20} aria-hidden="true" />
        {t("plan.import")}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".md,.markdown,.txt"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) importPlan(f);
          e.target.value = "";
        }}
      />
      {importMsg === "ok" && (
        <span className="ism-tag" role="status">
          <Check aria-hidden="true" />
          {t("plan.import.ok")}
        </span>
      )}
      {importMsg === "err" && (
        <span className="ism-tag ism-tag--alert" role="alert">
          <WarningTriangle aria-hidden="true" />
          {t("plan.import.err")}
        </span>
      )}
    </span>
  );

  // Generación asíncrona: startPlanJob responde al instante con un jobId y
  // el plan se construye en segundo plano en el servidor; sondeamos planJob
  // cada 4 s. Las peticiones largas las corta el proxy de producción; las
  // de sondeo duran milisegundos, así que esto aguanta cualquier límite.
  const trpcUtils = trpc.useUtils();
  const [jobRunning, setJobRunning] = useState(false);
  const [jobStage, setJobStage] = useState<string | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopPolling = () => {
    if (pollTimer.current) clearTimeout(pollTimer.current);
    if (genTimer.current) clearTimeout(genTimer.current);
    pollTimer.current = null;
  };

  const pollJob = async (jobId: string, elapsed = 0) => {
    try {
      const res = await trpcUtils.mentor.planJob.fetch({ jobId });
      console.log(
        `[21w] job ${jobId.slice(0, 8)} → ${res.status} (${Math.round(elapsed / 1000)}s)`
      );
      setElapsedSec(Math.round(elapsed / 1000));
      if (res.status === "running") {
        // la fase viene del servidor: starting | researching | writing
        setJobStage(res.stage ?? "starting");
      }
      if (res.status === "done" && res.plan) {
        console.log(
          `[21w] plan recibido: ${res.plan.weeks?.length ?? "?"} semanas`
        );
        stopPolling();
        setJobRunning(false);
        setPlan(res.plan);
        setAiError(false);
        return;
      }
      if (res.status === "error") {
        console.error(`[21w] job falló en el servidor:`, res.error);
        stopPolling();
        setJobRunning(false);
        setAiError(true);
        return;
      }
    } catch (e) {
      // un sondeo fallido no mata el trabajo: reintentamos
      console.warn(`[21w] sondeo falló (reintentamos):`, e);
    }
    if (elapsed >= 300_000) {
      // ~5 min: algo va muy mal en el servidor
      stopPolling();
      setJobRunning(false);
      setAiError(true);
      return;
    }
    pollTimer.current = setTimeout(() => pollJob(jobId, elapsed + 4000), 4000);
  };

  const startMutation = trpc.mentor.startPlanJob.useMutation({
    onSuccess: data => {
      console.log(`[21w] trabajo de plan iniciado: ${data.jobId}`);
      pollJob(data.jobId);
    },
    onError: err => {
      console.error("[21w] startPlanJob rechazado:", err);
      setJobRunning(false);
      setAiError(true);
    },
  });

  const generate = () => {
    if (!profile || !project) return;
    stopPolling();
    setAiError(false);
    setJobRunning(true);
    startMutation.mutate({
      locale,
      profile,
      projectId: project.id,
      issue: pickedIssue
        ? {
            id: pickedIssue.id,
            number: pickedIssue.number,
            title: pickedIssue.title,
            url: pickedIssue.url,
            labels: pickedIssue.labels,
            comments: pickedIssue.comments,
            body: pickedIssue.body,
          }
        : null,
    });
  };

  // autogenerar al llegar desde Issues con proyecto elegido y sin plan
  useEffect(() => {
    if (!plan && profile && project && !jobRunning && !aiError) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const askMentor = (weekTitle: string, n: number) => {
    const q =
      locale === "es"
        ? `Estoy en la semana ${n} de mi plan («${weekTitle}»). ¿Cómo la abordo?`
        : `I'm on week ${n} of my plan ("${weekTitle}"). How should I approach it?`;
    localStorage.setItem("oss21.mentorDraft", q);
    navigate("/mentor");
  };

  if (!project || !profile) {
    return (
      <>
        <PlanHero label={t("plan.eyebrow")} title={t("plan.title")} />
        <div className="app-container py-64">
          <div className="max-w-reading flex flex-col gap-24">
            <p className="ism-t-lead m-0">{t("plan.empty")}</p>
            <div className="flex flex-wrap items-center gap-16">
              <Link to="/projects" className="ism-btn">
                {t("plan.empty.cta")}
                <ArrowRight width={20} height={20} aria-hidden="true" />
              </Link>
              {importControls}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (jobRunning || startMutation.isPending || (!plan && !aiError)) {
    const stageKey = `plan.stage.${jobStage ?? "starting"}` as Parameters<
      typeof t
    >[0];
    return (
      <div className="app-container py-96">
        <div
          className="max-w-reading flex flex-col gap-16"
          role="status"
          aria-live="polite"
        >
          <span className="ism-bar" />
          <p className="ism-t-h3 text-text-heading m-0 chat-caret">
            {t("plan.generating")}
          </p>
          <p className="ism-t-body m-0">{t(stageKey)}</p>
          <p className="ism-t-caption text-text-muted m-0">
            {t("plan.generating.hint")} ·{" "}
            <span className="ism-t-figure">{elapsedSec} s</span>
          </p>
        </div>
      </div>
    );
  }

  if (aiError && !plan) {
    return (
      <div className="app-container py-96">
        <div className="max-w-reading flex flex-col gap-24">
          <Notice tone="alert" word={t("common.alert")}>
            {t("mentor.error.quota")}
          </Notice>
          <div>
            <button type="button" className="ism-btn" onClick={generate}>
              <Refresh width={20} height={20} aria-hidden="true" />
              {t("common.retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!plan) return null;

  const done = doneWeeks.length;
  const total = plan.weeks.length;
  const phases = [...new Set(plan.weeks.map(w => w.phase))];

  return (
    <>
      <PlanHero
        label={`${t("plan.eyebrow")} · ${plan.projectName}`}
        title={t("plan.title")}
      />
      <div className="app-container py-64">
        <div className="flex flex-col gap-16 mb-48 max-w-reading">
          <p className="ism-t-lead m-0">{plan.intro}</p>
          <AiLabel>{t("common.builtWithAi")}</AiLabel>
          {pickedIssue && (
            <p className="ism-t-body-small m-0">
              <ExternalLink href={pickedIssue.url}>
                #{pickedIssue.number} {pickedIssue.title}
              </ExternalLink>
            </p>
          )}
          <Progress
            label={t("plan.progress.label")}
            done={done}
            total={total}
            countLabel={t("plan.progress.count")
              .replace("{n}", String(done))
              .replace("{total}", String(total))}
            note={phases.join(" · ")}
          />
          <div className="flex flex-wrap items-center gap-16">
            <button type="button" className="ism-btn" onClick={exportPlan}>
              <Download width={20} height={20} aria-hidden="true" />
              {t("plan.export")}
            </button>
            {importControls}
            <button
              type="button"
              className="app-btn-tertiary"
              onClick={generate}
              disabled={jobRunning || startMutation.isPending}
            >
              <Refresh width={20} height={20} aria-hidden="true" />
              {t("plan.regenerate")}
            </button>
          </div>
          <p className="ism-t-caption text-text-muted m-0">
            {t("plan.export.hint")}
          </p>
        </div>

        <ol className="m-0 p-0 list-none border-t-2 border-rule-strong">
          {plan.weeks.map(w => {
            const isDone = doneWeeks.includes(w.week);
            return (
              <li
                key={w.week}
                className="py-32 border-b-1 border-hairline flex flex-col gap-16"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-16">
                  <div className="flex flex-col gap-8">
                    <p className="ism-label m-0">
                      {t("plan.week")} {w.week} · {w.phase}
                    </p>
                    <h2 className="ism-t-h3 text-text-heading m-0">
                      {w.title}
                    </h2>
                  </div>
                  <div className="shrink-0">
                    <Choice
                      type="checkbox"
                      name={`week-${w.week}`}
                      checked={isDone}
                      onChange={() => toggleWeek(w.week)}
                      title={isDone ? t("plan.weekDone") : t("plan.markDone")}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-24">
                  <div>
                    <p className="ism-label mt-0 mb-8">
                      {t("plan.objectives")}
                    </p>
                    <ul className="ism-t-body-small m-0 ps-24 list-disc flex flex-col gap-4">
                      {w.objectives.map((o, j) => (
                        <li key={j}>{o}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="ism-label mt-0 mb-8">{t("plan.tasks")}</p>
                    <ul className="ism-t-body-small m-0 ps-24 list-disc flex flex-col gap-4">
                      {w.tasks.map((task, j) => (
                        <li key={j}>{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {w.resources.length > 0 && (
                  <div>
                    <p className="ism-label mt-0 mb-8">{t("plan.resources")}</p>
                    <ul className="ism-t-body-small m-0 p-0 list-none flex flex-wrap gap-8 gap-x-24">
                      {w.resources.map((r, j) => (
                        <li key={j}>
                          <ExternalLink href={r.url}>{r.label}</ExternalLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-16 border-t-1 border-hairline flex flex-col md:flex-row md:items-center md:justify-between gap-12">
                  <p className="ism-t-body-small m-0">
                    <span className="ism-label me-8">{t("plan.outcome")}</span>
                    {w.outcome}
                  </p>
                  <button
                    type="button"
                    onClick={() => askMentor(w.title, w.week)}
                    className="app-btn-tertiary shrink-0"
                  >
                    <ChatLines width={20} height={20} aria-hidden="true" />
                    {t("plan.askMentor")}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        <section className="mt-64 max-w-reading">
          <SectionHead title={t("plan.graduation")} />
          <p className="ism-t-body m-0">{plan.graduation}</p>
          <p className="ism-label mt-32 mb-12">{t("plan.funding")}</p>
          <ul className="ism-t-body-small m-0 p-0 list-none flex flex-wrap gap-8 gap-x-24">
            {FUNDING.map(f => (
              <li key={f.url}>
                <ExternalLink href={f.url}>{f.label}</ExternalLink>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
