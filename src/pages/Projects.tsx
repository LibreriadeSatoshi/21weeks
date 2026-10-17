import { Link } from "react-router";
import { ArrowRight } from "iconoir-react";
import { PROJECTS, matchScore } from "@contracts/types";
import { useI18n } from "@/i18n";
import { useAppState } from "@/state";
import { trpc } from "@/providers/trpc";
import { ProjectLogo } from "@/components/ProjectLogo";
import { PageHeader } from "@/components/ismos";

export default function Projects() {
  const { t, locale } = useI18n();
  const { profile, setProjectId } = useAppState();
  const countsQuery = trpc.issues.all.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
  const counts = countsQuery.data?.counts ?? {};

  const sorted = [...PROJECTS].sort((a, b) =>
    profile ? matchScore(profile, b) - matchScore(profile, a) : 0
  );

  return (
    <div className="app-container py-64">
      <PageHeader
        label={t("projects.eyebrow")}
        title={profile ? t("projects.title") : t("catalog.title")}
        lead={profile ? t("projects.sub") : t("projects.noProfile")}
      >
        {!profile && (
          <div>
            <Link to="/quiz" className="ism-btn">
              {t("hero.cta")}
              <ArrowRight width={20} height={20} aria-hidden="true" />
            </Link>
          </div>
        )}
      </PageHeader>

      <ol className="m-0 p-0 list-none border-t-2 border-rule-strong">
        {sorted.map(p => {
          const score = profile ? matchScore(profile, p) : null;
          const n = counts[p.id];
          const facts = [
            t(`projects.host.${p.host}` as const),
            t(`projects.difficulty.${p.difficulty}` as const),
            ...(n !== undefined ? [`${n} ${t("projects.issues")}`] : []),
          ];
          return (
            <li
              key={p.id}
              className="py-24 border-b-1 border-hairline flex flex-col md:flex-row md:items-center gap-24"
            >
              <div className="flex-1 min-w-0 flex flex-col gap-8">
                <div className="flex items-center gap-12">
                  <ProjectLogo id={p.id} size={32} />
                  <h2 className="ism-t-h3 text-text-heading m-0">{p.name}</h2>
                </div>
                <p className="ism-label m-0">{facts.join(" · ")}</p>
                <p className="ism-t-body-small m-0 max-w-reading">
                  {p.summary[locale]}
                </p>
                <p className="ism-t-caption text-text-muted m-0">
                  {p.languages.join(" · ")}
                </p>
              </div>

              <div className="flex md:flex-col items-center md:items-end gap-16 shrink-0">
                {score !== null && (
                  <p className="m-0 flex items-baseline gap-8">
                    <span className="ism-t-figure text-text-heading">
                      {score} / 100
                    </span>
                    <span className="ism-t-caption text-text-muted">
                      {t("projects.match")}
                    </span>
                  </p>
                )}
                <Link
                  to={`/issues/${p.id}`}
                  onClick={() => setProjectId(p.id)}
                  className="ism-btn ism-btn--secondary"
                  aria-label={`${t("projects.view")}: ${p.name}`}
                >
                  {t("projects.view")}
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
