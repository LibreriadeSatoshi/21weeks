import { LEARNING_RESOURCES } from "@contracts/types";
import { useI18n } from "@/i18n";
import { useAppState } from "@/state";
import { OpenNewWindow } from "iconoir-react";
import { ExternalLink, QuarterHeader, SectionHead } from "@/components/ismos";

const PROVIDER_META = {
  lds: {
    name: "Librería de Satoshi",
    url: "https://libreriadesatoshi.com/",
    links: [
      { url: "https://libreriadesatoshi.com/", label: "libreriadesatoshi.com" },
      {
        url: "https://moodle.libreriadesatoshi.com/",
        label: { es: "Campus (Moodle)", en: "Campus (Moodle)" },
      },
    ],
    tag: {
      es: "Cursos en español de la academia bitcoiner de habla hispana",
      en: "Courses in Spanish from the Spanish-speaking bitcoiner academy",
    },
  },
  bdev: {
    name: "The Bitcoin Dev Project",
    url: "https://bitcoindevs.xyz/",
    tag: {
      es: "Biblioteca curada, proyectos BOSS y guía de financiación",
      en: "Curated library, BOSS projects and funding guide",
    },
  },
  nostrbook: {
    name: "Nostrbook",
    url: "https://nostrbook.dev/",
    tag: {
      es: "Registro estructurado de documentación Nostr: kinds, tags y protocolo",
      en: "Structured registry of Nostr docs: kinds, tags and protocol",
    },
  },
} as const;

export default function Resources() {
  const { t, locale } = useI18n();
  const { profile } = useAppState();

  const relevant = (tracks: string[]) =>
    profile ? tracks.filter(tr => profile.tracks.includes(tr)).length : 0;

  return (
    <>
      <QuarterHeader
        label={t("resources.eyebrow")}
        title={t("resources.title")}
        lead={t("resources.sub")}
      >
        {profile && (
          <p className="ism-t-caption text-text-muted m-0">
            {t("resources.personalized")}
          </p>
        )}
      </QuarterHeader>
      <div className="app-container pb-64">
        {(["lds", "bdev", "nostrbook"] as const).map(prov => {
          const meta = PROVIDER_META[prov];
          const items = LEARNING_RESOURCES.filter(
            r => r.provider === prov
          ).sort((a, b) => relevant(b.tracks) - relevant(a.tracks));
          const links =
            "links" in meta
              ? meta.links.map(l => ({
                  url: l.url,
                  label:
                    typeof l.label === "string" ? l.label : l.label[locale],
                }))
              : [
                  {
                    url: meta.url,
                    label: meta.url.replace("https://", "").replace(/\/$/, ""),
                  },
                ];
          return (
            <section key={prov} className="mb-64">
              <SectionHead title={meta.name} />
              <p className="ism-t-body-small m-0">{meta.tag[locale]}</p>
              <ul className="ism-t-body-small mt-8 mb-24 p-0 list-none flex flex-wrap gap-8 gap-x-24">
                {links.map(l => (
                  <li key={l.url}>
                    <ExternalLink href={l.url}>{l.label}</ExternalLink>
                  </li>
                ))}
              </ul>
              <div className="grid md:grid-cols-2 gap-24">
                {items.map(r => {
                  const hits = relevant(r.tracks);
                  return (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ism-card"
                    >
                      <span className="ism-bar" />
                      <span className="ism-label">
                        {t(`resources.kind.${r.kind}` as const)} ·{" "}
                        {r.lang.toUpperCase()}
                      </span>
                      <h3 className="ism-card__title">{r.title[locale]}</h3>
                      <p className="ism-card__text">{r.note[locale]}</p>
                      <div className="ism-card__facts mt-auto justify-between">
                        <span>
                          {hits > 0
                            ? `${hits} ${t("resources.matchTracks")}`
                            : meta.name}
                        </span>
                        <OpenNewWindow
                          width={16}
                          height={16}
                          aria-hidden="true"
                        />
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
