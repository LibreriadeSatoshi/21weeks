import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, ArrowRight, Check } from "iconoir-react";
import {
  PROJECTS,
  CULTURE,
  type Issue,
  type RankedIssue,
} from "@contracts/types";
import { useI18n } from "@/i18n";
import { useAppState } from "@/state";
import { trpc } from "@/providers/trpc";
import { ProjectLogo } from "@/components/ProjectLogo";
import { AiLabel, ExternalLink, Notice, SectionHead } from "@/components/ismos";

export default function Issues() {
  const { id: projectId } = useParams<{ id: string }>();
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const { profile, setProjectId, setPickedIssue, pickedIssue } = useAppState();
  const [rankings, setRankings] = useState<RankedIssue[] | null>(null);
  const [aiError, setAiError] = useState(false);

  const project = PROJECTS.find(p => p.id === projectId);
  const issuesQuery = trpc.issues.forProject.useQuery(
    { projectId: projectId ?? "" },
    { enabled: !!project, staleTime: 5 * 60 * 1000, retry: 1 }
  );
  const issues = useMemo(
    () => issuesQuery.data?.issues ?? [],
    [issuesQuery.data]
  );
  const usedFallback = issuesQuery.data?.usedFallback ?? false;

  const rankMutation = trpc.mentor.recommendIssues.useMutation({
    onSuccess: data => {
      setRankings(data.rankings);
      setAiError(false);
    },
    onError: () => setAiError(true),
  });

  const ordered = useMemo(() => {
    if (!rankings) return issues;
    const byId = new Map(issues.map(i => [i.id, i]));
    const ranked = rankings
      .map(r => ({ issue: byId.get(r.issueId), ranking: r }))
      .filter((x): x is { issue: Issue; ranking: RankedIssue } => !!x.issue);
    const rest = issues.filter(i => !rankings.some(r => r.issueId === i.id));
    return [...ranked.map(x => x.issue), ...rest];
  }, [issues, rankings]);

  if (!project) {
    return (
      <div className="app-container py-96 flex flex-col gap-24 max-w-reading">
        <p className="ism-label m-0">404</p>
        <p className="ism-t-lead m-0">{t("common.error")}</p>
        <div>
          <Link to="/projects" className="ism-btn ism-btn--secondary">
            <ArrowLeft width={20} height={20} aria-hidden="true" />
            {t("issues.back")}
          </Link>
        </div>
      </div>
    );
  }

  const rankIssue = (id: string) => rankings?.find(r => r.issueId === id);

  const startPlan = (issue: Issue | null) => {
    setProjectId(project.id);
    setPickedIssue(issue);
    navigate("/plan");
  };

  const links = [
    { href: project.urls.repo, label: project.repo },
    { href: project.urls.contributing, label: t("issues.link.contributing") },
    { href: project.urls.docs, label: t("issues.link.docs") },
    { href: project.urls.chat, label: t("issues.link.chat") },
    { href: project.urls.chatAlt, label: t("issues.link.devChat") },
  ].filter((l): l is { href: string; label: string } => !!l.href);

  return (
    <div className="app-container py-64">
      <Link to="/projects" className="app-btn-tertiary">
        <ArrowLeft width={20} height={20} aria-hidden="true" />
        {t("issues.back")}
      </Link>

      <header className="flex flex-col gap-16 mt-32 mb-48 max-w-reading">
        <span className="ism-bar" />
        <p className="ism-label m-0">{t("issues.eyebrow")}</p>
        <div className="flex items-center gap-16">
          <ProjectLogo id={project.id} size={48} />
          <h1 className="ism-t-h1 text-text-heading m-0">
            {t("issues.title")} {project.name}
          </h1>
        </div>
        <p className="ism-t-lead m-0">{project.summary[locale]}</p>
        <ul className="flex flex-wrap gap-8 gap-x-24 m-0 p-0 list-none ism-t-body-small">
          {links.map(l => (
            <li key={l.href}>
              <ExternalLink href={l.href}>{l.label}</ExternalLink>
            </li>
          ))}
        </ul>
      </header>

      <section className="max-w-reading mb-48">
        <SectionHead title={t("issues.culture")} as="h2" />
        <span className="ism-tag mb-16">
          <Check aria-hidden="true" />
          {t("issues.mentorSkill")}
        </span>
        <p className="ism-t-body mt-16 mb-0">{CULTURE[project.id]?.[locale]}</p>
      </section>

      <section>
        <SectionHead title={t("issues.listTitle")} as="h2" />

        <div className="flex flex-wrap items-center gap-16 mb-32">
          <button
            type="button"
            className="ism-btn"
            disabled={!profile || issues.length === 0 || rankMutation.isPending}
            onClick={() => {
              if (!profile) return;
              rankMutation.mutate({
                locale,
                profile,
                projectId: project.id,
                issues: issues.slice(0, 15),
              });
            }}
          >
            {rankMutation.isPending
              ? t("issues.aiRanking")
              : t("issues.aiRank")}
          </button>
          {!profile && <Link to="/quiz">{t("projects.noProfile")}</Link>}
        </div>

        {aiError && (
          <div className="mb-32">
            <Notice tone="alert" word={t("common.alert")}>
              {t("mentor.error.quota")}
            </Notice>
          </div>
        )}

        {usedFallback && (
          <div className="mb-32">
            <Notice
              tone="info"
              word={t("common.note")}
              title={t("issues.fallback.title")}
            >
              {t("issues.fallback.body")}
            </Notice>
          </div>
        )}
        {issuesQuery.isLoading && (
          <p className="ism-t-body text-text-muted py-32 m-0" role="status">
            {t("issues.loading")}
          </p>
        )}
        {issuesQuery.isSuccess && issues.length === 0 && (
          <p className="ism-t-body py-32 m-0">{t("issues.empty")}</p>
        )}

        <ol className="m-0 p-0 list-none border-t-1 border-hairline">
          {ordered.map(issue => {
            const r = rankIssue(issue.id);
            const isPicked = pickedIssue?.id === issue.id;
            const facts = [
              ...issue.labels.slice(0, 5),
              `${issue.comments} ${t("issues.comments")}`,
            ];
            return (
              <li
                key={issue.id}
                className="py-24 border-b-1 border-hairline flex flex-col gap-12"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-12">
                  <h3 className="ism-t-body m-0">
                    <ExternalLink href={issue.url}>
                      #{issue.number} {issue.title}
                    </ExternalLink>
                  </h3>
                  {r && (
                    <p className="m-0 flex items-baseline gap-8 shrink-0">
                      <span className="ism-t-figure text-text-heading">
                        {r.score} / 100
                      </span>
                      <span className="ism-t-caption text-text-muted">
                        {t("projects.match")}
                      </span>
                    </p>
                  )}
                </div>
                <p className="ism-label m-0">{facts.join(" · ")}</p>

                {r && (
                  <div className="flex flex-col gap-8 max-w-reading">
                    <p className="m-0 flex flex-wrap items-center gap-12">
                      <span className="ism-label">{t("issues.reason")}</span>
                      <AiLabel>{t("common.builtWithAi")}</AiLabel>
                    </p>
                    <p className="ism-t-body-small m-0">{r.reason}</p>
                  </div>
                )}

                <div>
                  <button
                    type="button"
                    className="ism-btn ism-btn--secondary"
                    onClick={() => startPlan(issue)}
                  >
                    {isPicked && (
                      <Check width={20} height={20} aria-hidden="true" />
                    )}
                    {isPicked ? t("issues.picked") : t("issues.pick")}
                  </button>
                </div>
              </li>
            );
          })}
        </ol>

        {issues.length > 0 && (
          <div className="mt-32">
            <button
              type="button"
              className="app-btn-tertiary"
              onClick={() => startPlan(null)}
            >
              {t("issues.makePlanNoIssue")}
              <ArrowRight width={20} height={20} aria-hidden="true" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
