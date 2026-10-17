import crypto from "node:crypto";
import type { MiddlewareHandler } from "hono";
import { getCookie, setCookie } from "hono/cookie";

// Acceso privado hasta el lanzamiento: si SITE_PASSWORD está definida, todo
// (páginas, JS, API) queda detrás de una contraseña. Solo pasan la página de
// acceso y /api/health (para el despliegue). La cookie va
// con Domain=COOKIE_DOMAIN para valer en ismos.xyz/21weeks y en app.ismos.xyz.

export const ACCESS_COOKIE = "w21_access";
const ACCESS_PATH = "/__access";
const MAX_AGE_S = 30 * 24 * 60 * 60;

export type SiteGateOptions = {
  password: string;
  basePath: string;
  cookieDomain?: string;
  secure: boolean;
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

// Página genérica a propósito: no dice qué sitio protege (ni nombre, ni logo,
// ni estilos de la app), igual que la protección por contraseña de Netlify.
const GATE_STYLE = `
*{box-sizing:border-box}
body{margin:0;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:48px 16px;background:#131d24;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#131d24}
form{width:100%;max-width:440px;background:#fff;border-radius:12px;padding:40px 48px}
h1{margin:0 0 16px;font-size:28px;line-height:1.2}
p{margin:0 0 24px;font-size:18px;line-height:1.5}
label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
input[type=password]{width:100%;height:56px;padding:0 16px;font:inherit;font-size:18px;border:2px solid #c9d1d6;border-radius:6px}
input[type=password]:focus{outline:none;border-color:#f0c040}
.error input[type=password]{border-color:#c0392b}
.msg{margin:8px 0 0;font-size:15px;color:#c0392b}
button{width:100%;height:56px;margin-top:24px;border:0;border-radius:6px;background:#2f6f68;color:#fff;font:inherit;font-size:18px;font-weight:600;cursor:pointer}
button:focus-visible{outline:3px solid #f0c040;outline-offset:2px}
@media (max-width:480px){form{padding:32px 24px}}
`;

function gatePage(opts: { basePath: string; next: string; error: boolean }) {
  const { basePath, next, error } = opts;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Password protected site</title>
<style>${GATE_STYLE}</style>
</head>
<body>
<form method="post" action="${basePath}${ACCESS_PATH}"${error ? ' class="error"' : ""}>
<h1>Password protected site</h1>
<p>Please enter your password to get access.</p>
<input type="hidden" name="next" value="${escapeHtml(next)}">
<label for="pw">Password</label>
<input id="pw" name="password" type="password" placeholder="Password" autocomplete="current-password" required autofocus${error ? ' aria-invalid="true" aria-describedby="pw-error"' : ""}>
${error ? '<p id="pw-error" class="msg" role="alert">Incorrect password. Please try again.</p>' : ""}
<button type="submit">Submit</button>
</form>
</body>
</html>`;
}

export function siteGate(opts: SiteGateOptions): MiddlewareHandler {
  const token = accessToken(opts.password);

  return async (c, next) => {
    c.header("X-Robots-Tag", "noindex, nofollow");

    const rel = c.req.path.slice(opts.basePath.length) || "/";
    if (c.req.method === "OPTIONS" || rel === "/api/health") {
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
      }),
      401
    );
  };
}
