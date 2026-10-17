// Piezas de página de ISMOS que no están en el bundle del kit (components.css).
// Siguen design/ismos/docs/10-accepted-decisions.md §2.
import type { ReactNode } from "react";
import {
  Check,
  InfoCircle,
  OpenNewWindow,
  WarningTriangle,
} from "iconoir-react";
import ismosMarkPaper from "../../design/ismos/logos/ismos-mark-paper.svg";

/** Cabecera de página: barra de 6 px, etiqueta, título y entradilla. */
export function PageHeader({
  label,
  title,
  lead,
  children,
}: {
  label: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-16 mb-48 max-w-reading">
      <span className="ism-bar" />
      <p className="ism-label m-0">{label}</p>
      <h1 className="ism-t-h1 text-text-heading m-0">{title}</h1>
      {lead && <p className="ism-t-lead m-0">{lead}</p>}
      {children}
    </header>
  );
}

/** Cabecera de sección: número, título y la regla de 2 px que la cierra. */
export function SectionHead({
  num,
  title,
  as: Tag = "h2",
}: {
  num?: string;
  title: ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <div className="ism-sectionhead mb-24">
      <Tag className="m-0">
        {num && <span className="ism-sectionhead__num">{num}</span>}
        <span className="ism-sectionhead__title">{title}</span>
      </Tag>
    </div>
  );
}

/** Progreso: "2 de 5" + barra + una frase. Nunca un porcentaje solo. */
export function Progress({
  label,
  done,
  total,
  countLabel,
  note,
}: {
  label: ReactNode;
  done: number;
  total: number;
  countLabel: string;
  note?: ReactNode;
}) {
  return (
    <div>
      <div className="ism-progress__head">
        <span>{label}</span>
        <span className="ism-progress__count">{countLabel}</span>
      </div>
      <div
        className="ism-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={countLabel}
      >
        <div
          className="ism-progress__fill"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>
      {note && <p className="ism-progress__note">{note}</p>}
    </div>
  );
}

/** Opción seleccionable: radio (una de 2–5) o casilla (varias). */
export function Choice({
  type,
  name,
  checked,
  onChange,
  title,
  desc,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  title: ReactNode;
  desc?: ReactNode;
}) {
  return (
    <label className="app-choice">
      <input
        type={type}
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <span
        className={`app-choice__box app-choice__box--${type}`}
        aria-hidden="true"
      >
        {type === "checkbox" && (
          <Check width={16} height={16} strokeWidth={2} />
        )}
      </span>
      <span className="flex flex-col gap-4">
        <span className="app-choice__title">{title}</span>
        {desc && (
          <span className="ism-t-body-small text-text-muted">{desc}</span>
        )}
      </span>
    </label>
  );
}

/** Aviso: etiqueta de estado (color + icono + PALABRA) y el texto debajo, entre reglas. */
export function Notice({
  tone,
  word,
  title,
  children,
}: {
  tone: "info" | "alert";
  word: string;
  title?: ReactNode;
  children: ReactNode;
}) {
  const Icon = tone === "alert" ? WarningTriangle : InfoCircle;
  return (
    <div
      className="flex flex-col gap-8 py-16 border-y-1 border-hairline max-w-reading"
      role={tone === "alert" ? "alert" : "status"}
    >
      <span
        className={`ism-tag self-start ${tone === "alert" ? "ism-tag--alert" : ""}`}
      >
        <Icon aria-hidden="true" />
        {word}
      </span>
      {title && (
        <p className="ism-t-body m-0 text-text-heading">
          <strong>{title}</strong>
        </p>
      )}
      <div className="ism-t-body-small">{children}</div>
    </div>
  );
}

/** Enlace que abre otra web: palabra + icono, nunca el icono solo. */
export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-4"
    >
      {children}
      <OpenNewWindow width={16} height={16} aria-hidden="true" />
    </a>
  );
}

/** Material generado por IA: siempre etiquetado (05 Voice and tone). */
export function AiLabel({ children }: { children: ReactNode }) {
  return <span className="ism-label ism-label--ai">{children}</span>;
}

/**
 * Cabecera con bloque de color de un cuarto de la superficie (01.1, dispositivo 4):
 * el texto a la izquierda sobre Paper y, a sangre hasta el borde derecho, un bloque
 * Indigo plano con el mark en Paper. En móvil el bloque pasa a ser una banda superior.
 */
export function QuarterHeader(props: Parameters<typeof PageHeader>[0]) {
  return (
    <section className="app-quarter">
      <div className="app-quarter__text">
        <PageHeader {...props} />
      </div>
      <div className="app-quarter__block" aria-hidden="true">
        <img src={ismosMarkPaper} alt="" width={48} height={48} />
      </div>
    </section>
  );
}
