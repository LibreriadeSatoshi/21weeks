import { Link } from "react-router";
import { ArrowRight } from "iconoir-react";
import { PROJECTS } from "@contracts/types";
import { useI18n, type TKey } from "@/i18n";
import { Reveal } from "@/components/Layout";

function SectionHead({ num, title }: { num: string; title: string }) {
  return (
    <div className="ism-sectionhead mb-32">
      <h2 className="m-0">
        <span className="ism-sectionhead__num">{num}</span>
        <span className="ism-sectionhead__title">{title}</span>
      </h2>
    </div>
  );
}

export default function Home() {
  const { t, locale } = useI18n();

  return (
    <div>
      {/* Portada */}
      <section className="app-container py-64 md:py-96">
        <Reveal>
          <div className="flex flex-col gap-24 max-w-reading">
            <span className="ism-bar" />
            <p className="ism-label m-0">{t("hero.eyebrow")}</p>
            <h1 className="ism-t-display text-text-heading m-0">
              {t("hero.title.a")} {t("hero.title.b")} {t("hero.title.c")}
            </h1>
            <p className="ism-t-lead m-0">{t("hero.sub")}</p>
            <div className="flex flex-wrap gap-16">
              <Link to="/quiz" className="ism-btn">
                {t("hero.cta")}
                <ArrowRight width={20} height={20} aria-hidden="true" />
              </Link>
              <Link to="/projects" className="ism-btn ism-btn--secondary">
                {t("hero.cta2")}
              </Link>
            </div>
            <dl className="app-facts">
              <div>
                <dt>21</dt>
                <dd>{t("home.facts.weeks")}</dd>
              </div>
              <div>
                <dt>4 h</dt>
                <dd>{t("home.facts.hours")}</dd>
              </div>
              <div>
                <dt>{PROJECTS.length}</dt>
                <dd>{t("home.facts.projects")}</dd>
              </div>
              <div>
                <dt>2</dt>
                <dd>{t("home.facts.forges")}</dd>
              </div>
            </dl>
            <p className="ism-t-caption text-text-muted m-0">
              {t("hero.noShitcoins")}
            </p>
          </div>
        </Reveal>
      </section>

      {/* Cómo funciona */}
      <section className="app-container pb-64 md:pb-96">
        <Reveal>
          <SectionHead num="01" title={t("how.title")} />
        </Reveal>
        <ol className="grid md:grid-cols-3 gap-32 m-0 p-0 list-none">
          {[1, 2, 3].map(n => (
            <li key={n} className="flex flex-col gap-12">
              <Reveal delay={n * 80}>
                <p className="ism-label m-0">{t(`how.${n}.t` as TKey)}</p>
                <p className="ism-t-body mt-12 mb-0">
                  {t(`how.${n}.d` as TKey)}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* Catálogo */}
      <section className="app-container pb-64 md:pb-96">
        <Reveal>
          <SectionHead num="02" title={t("catalog.title")} />
          <p className="ism-t-lead max-w-reading mt-0 mb-32">
            {t("catalog.sub")}
          </p>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-24">
          {PROJECTS.slice(0, 6).map(p => (
            <Link key={p.id} to={`/issues/${p.id}`} className="ism-card">
              <span className="ism-bar" />
              <span className="ism-label">
                {p.languages.slice(0, 3).join(" · ")}
              </span>
              <h3 className="ism-card__title">{p.name}</h3>
              <p className="ism-card__text">{p.tagline[locale]}</p>
              <div className="ism-card__facts mt-auto">
                <span>{p.host === "gitlab" ? "GitLab" : "GitHub"}</span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-32">
          <Link to="/projects" className="ism-btn ism-btn--secondary">
            {t("catalog.cta")}
          </Link>
        </div>
      </section>

      {/* El mentor en tu terminal */}
      <section className="app-ink py-64 md:py-96">
        <div className="app-container">
          <Reveal>
            <div className="flex flex-col gap-24 max-w-reading">
              <span className="ism-bar" />
              <p className="ism-label m-0">{t("cli.eyebrow")}</p>
              <h2 className="ism-t-h1 text-text-heading m-0">
                {t("cli.title")}
              </h2>
              <p className="ism-t-lead m-0">{t("cli.sub")}</p>
              <div className="ism-term">
                <div>
                  <span className="pr">$</span> npx 21w-mentor init
                </div>
                <div className="cm"># {t("home.cli.comment")}</div>
                <div>
                  <span className="pr">$</span>{" "}
                  <span className="cur">&nbsp;</span>
                </div>
              </div>
            </div>
          </Reveal>
          <ul className="grid md:grid-cols-3 gap-32 mt-48 mb-0 p-0 list-none">
            {[1, 2, 3].map(n => (
              <li
                key={n}
                className="flex flex-col gap-8 pt-16 border-t-1 border-hairline"
              >
                <h3 className="ism-t-h3 text-text-heading m-0">
                  {t(`cli.p${n}.t` as TKey)}
                </h3>
                <p className="ism-t-body-small m-0">
                  {t(`cli.p${n}.d` as TKey)}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-48">
            <Link to="/21w" className="ism-btn">
              {t("cli.cta")}
              <ArrowRight width={20} height={20} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
