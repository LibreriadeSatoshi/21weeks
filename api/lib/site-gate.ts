import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";

// Acceso privado hasta el lanzamiento: si SITE_PASSWORD está definida, todo
// (páginas, JS, API) queda detrás de una contraseña. Solo pasan la página de
// acceso, su CSS y fuentes, y /api/health (para el despliegue). La cookie va
// con Domain=COOKIE_DOMAIN para valer en ismos.xyz/21weeks y en app.ismos.xyz.

export const ACCESS_COOKIE = "w21_access";
const ACCESS_PATH = "/__access";
const MAX_AGE_S = 30 * 24 * 60 * 60;

export type SiteGateOptions = {
  password: string;
  basePath: string;
  cookieDomain?: string;
  secure: boolean;
  /** Carpeta del build del frontend, para enlazar su CSS en la página de acceso. */
  publicDir?: string;
};

/** El valor de la cookie depende de la contraseña: cambiarla invalida los accesos. */
export function accessToken(password: string): string {
  return crypto
    .createHmac("sha256", password)
    .update("21weeks-site-access-v1")
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/** El mark oficial, leído tal cual del kit (el Dockerfile copia design/ismos/logos). */
function readMark(): string | null {
  try {
    const svg = fs.readFileSync(
      path.resolve("design/ismos/logos/ismos-mark-paper.svg")
    );
    return `data:image/svg+xml;base64,${svg.toString("base64")}`;
  } catch {
    return null;
  }
}

function findStylesheet(publicDir?: string): string | null {
  if (!publicDir) return null;
  try {
    const css = fs
      .readdirSync(path.join(publicDir, "assets"))
      .find(f => /^index-.*\.css$/.test(f));
    return css ? `assets/${css}` : null;
  } catch {
    return null;
  }
}

/** Solo rutas internas bajo el prefijo; cualquier otra cosa vuelve a la portada. */
function safeNext(next: string | undefined, basePath: string): string {
  const home = `${basePath}/`;
  if (
    !next ||
    !next.startsWith(home) ||
    next.startsWith("//") ||
    next.includes("\\")
  )
    return home;
  return next;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, ch => `&#${ch.charCodeAt(0)};`);
}

const WARNING_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="1.5" aria-hidden="true"><path d="M20.04 21H3.96c-1.54 0-2.5-1.66-1.74-3l8.05-13.98c.77-1.34 2.7-1.34 3.47 0L21.78 18c.76 1.34-.2 3-1.74 3Z" stroke="currentColor" stroke-linecap="round"/><path d="M12 9v4M12 17.01l.01-.01" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function gatePage(opts: {
  basePath: string;
  next: string;
  error: boolean;
  stylesheet: string | null;
  mark: string | null;
}) {
  const { basePath, next, error, stylesheet, mark } = opts;
  const css = stylesheet
    ? `<link rel="stylesheet" href="${basePath}/${stylesheet}">`
    : "";
  const markImg = mark
    ? `<img src="${mark}" alt="ISMOS" width="20" height="20">`
    : "";
  const errorBlock = error
    ? `<p id="pw-error" class="ism-field__msg">${WARNING_ICON} Esa contraseña no es correcta. Revísala y vuelve a intentarlo.</p>`
    : "";
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Acceso privado · 21 Weeks</title>
${css}
</head>
<body class="ism-root">
<header class="app-nav"><div class="app-nav__inner"><span class="app-nav__brand">${markImg}<span>21 Weeks</span></span></div></header>
<main class="app-container py-96">
<form method="post" action="${basePath}${ACCESS_PATH}" class="flex flex-col gap-24 max-w-reading">
<span class="ism-bar"></span>
<p class="ism-label m-0">Acceso privado</p>
<h1 class="ism-t-h1 text-text-heading m-0">21 Weeks todavía no está abierto</h1>
<p class="ism-t-lead m-0">Estamos preparando el lanzamiento. Si tienes la contraseña, escríbela para entrar.</p>
<p class="ism-t-body-small text-text-muted m-0" lang="en">Private preview. Enter the password to continue.</p>
<input type="hidden" name="next" value="${escapeHtml(next)}">
<div class="ism-field${error ? " ism-field--error" : ""}">
<label for="pw">Contraseña</label>
<input id="pw" name="password" type="password" class="ism-field__input" autocomplete="current-password" required autofocus${error ? ' aria-invalid="true" aria-describedby="pw-error"' : ""}>
${errorBlock}
</div>
<div><button type="submit" class="ism-btn">Entrar</button></div>
</form>
</main>
</body>
</html>`;
}

export function siteGate(opts: SiteGateOptions): MiddlewareHandler {
  const token = accessToken(opts.password);
  const stylesheet = findStylesheet(opts.publicDir);
  const mark = readMark();

  return async (c, next) => {
    c.header("X-Robots-Tag", "noindex, nofollow");

    const rel = c.req.path.slice(opts.basePath.length) || "/";
    if (
      c.req.method === "OPTIONS" ||
      rel === "/api/health" ||
      /^\/assets\/[^/]+\.(css|woff2)$/.test(rel)
    ) {
      return next();
    }

    if (rel === ACCESS_PATH && c.req.method === "POST") {
      const form = await c.req.parseBody();
      const target = safeNext(
        typeof form.next === "string" ? form.next : undefined,
        opts.basePath
      );
      const password = typeof form.password === "string" ? form.password : "";
      if (!safeEqual(accessToken(password), token)) {
        return c.html(
          gatePage({
            basePath: opts.basePath,
            next: target,
            error: true,
            stylesheet,
            mark,
          }),
          401
        );
      }
      setCookie(c, ACCESS_COOKIE, token, {
        httpOnly: true,
        secure: opts.secure,
        sameSite: "Lax",
        path: "/",
        maxAge: MAX_AGE_S,
        ...(opts.cookieDomain ? { domain: opts.cookieDomain } : {}),
      });
      return c.redirect(target, 303);
    }

    const cookie = getCookie(c, ACCESS_COOKIE);
    if (cookie && safeEqual(cookie, token)) return next();

    if (rel.startsWith("/api/")) {
      return c.json({ error: "site locked" }, 401);
    }
    const nextUrl = c.req.method === "GET" ? c.req.path : `${opts.basePath}/`;
    return c.html(
      gatePage({
        basePath: opts.basePath,
        next: nextUrl,
        error: false,
        stylesheet,
        mark,
      }),
      401
    );
  };
}
