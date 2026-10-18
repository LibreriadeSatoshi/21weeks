import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

// Optional outside the Kimi platform: the app works in anonymous mode.
function optional(name: string): string {
  return process.env[name] ?? "";
}

/** "/21weeks" from BASE_PATH="/21weeks/" (or "" if there is no prefix). */
function basePath(value: string | undefined): string {
  const trimmed = (value ?? "").replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "";
}

export const env = {
  // "Sign in with Kimi" login (only inside the Kimi platform).
  // Outside Kimi these are left empty and the app runs in anonymous mode.
  appId: optional("APP_ID"),
  appSecret: optional("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: optional("KIMI_AUTH_URL"),
  kimiOpenUrl: optional("KIMI_OPEN_URL"),
  ownerUnionId: optional("OWNER_UNION_ID"),
  // Deployment
  basePath: basePath(process.env.BASE_PATH),
  // Origins allowed to call the API from another domain (e.g. https://ismos.xyz)
  // Access password until launch (empty = open site)
  sitePassword: optional("SITE_PASSWORD"),
  // Access cookie domain, e.g. ismos.xyz for ismos.xyz and app.ismos.xyz
  cookieDomain: optional("COOKIE_DOMAIN"),
  corsOrigins: optional("CORS_ORIGINS")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

/** true if Kimi login is configured (platform). false = anonymous. */
export const kimiAuthEnabled = Boolean(env.appId && env.kimiAuthUrl);
