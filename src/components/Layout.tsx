import { useEffect, useRef, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { Language } from "iconoir-react";
import { useI18n, type TKey } from "@/i18n";
import ismosMark from "../../design/ismos/logos/ismos-mark-paper.svg";

// Cuatro enlaces como máximo (ISMOS 10 §2, barra de navegación web).
// El perfil se abre desde la portada y "En tu terminal" está en el pie.
const NAV: { to: string; key: TKey }[] = [
  { to: "/projects", key: "nav.projects" },
  { to: "/plan", key: "nav.plan" },
  { to: "/mentor", key: "nav.mentor" },
  { to: "/recursos", key: "nav.resources" },
];

const REPO_URL = "https://github.com/LibreriadeSatoshi/21weeks";

export function Layout({ children }: { children: ReactNode }) {
  const { locale, setLocale, t } = useI18n();
  const location = useLocation();
  const other = locale === "es" ? "en" : "es";

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="app-nav">
        <div className="app-nav__inner">
          <Link to="/" className="app-nav__brand">
            <img src={ismosMark} alt="ISMOS" width={20} height={20} />
            <span>21 Weeks</span>
          </Link>
          <nav className="app-nav__links" aria-label={t("nav.label")}>
            {NAV.map(item => (
              <NavLink key={item.to} to={item.to}>
                {t(item.key)}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="app-nav__lang"
            onClick={() => setLocale(other)}
            lang={other}
            aria-label={t("nav.switchLang")}
          >
            <Language width={20} height={20} aria-hidden="true" />
            {other.toUpperCase()}
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="app-footer">
        <div className="app-footer__inner">
          <div className="flex items-center gap-12">
            <img src={ismosMark} alt="ISMOS" width={32} height={32} />
            <span className="ism-label ism-label--on-color">ISMOS.XYZ</span>
          </div>
          <p className="ism-t-body-small m-0 max-w-reading">{t("footer")}</p>
          <ul className="app-footer__links">
            <li>
              <Link to="/21w">{t("nav.cli")}</Link>
            </li>
            <li>
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                {t("footer.code")}
              </a>
            </li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

/** Reveal on scroll */
export function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("is-visible"), delay);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);
  return (
    <div ref={ref} className="reveal">
      {children}
    </div>
  );
}
