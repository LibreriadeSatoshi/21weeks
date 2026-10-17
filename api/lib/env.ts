import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

// Opcional fuera de la plataforma Kimi: la app funciona en modo anónimo.
function optional(name: string): string {
  return process.env[name] ?? "";
}

/** "/21weeks" a partir de BASE_PATH="/21weeks/" (o "" si no hay prefijo). */
function basePath(value: string | undefined): string {
  const trimmed = (value ?? "").replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "";
}

export const env = {
  // — Login "Sign in with Kimi" (solo dentro de la plataforma Kimi) —
  // Fuera de Kimi se dejan vacías y la app corre en modo anónimo.
  appId: optional("APP_ID"),
  appSecret: optional("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: required("DATABASE_URL"),
  kimiAuthUrl: optional("KIMI_AUTH_URL"),
  kimiOpenUrl: optional("KIMI_OPEN_URL"),
  ownerUnionId: optional("OWNER_UNION_ID"),
  // — Despliegue —
  basePath: basePath(process.env.BASE_PATH),
  // Orígenes que pueden llamar a la API desde otro dominio (p. ej. https://ismos.xyz)
  corsOrigins: optional("CORS_ORIGINS")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

/** true si el login con Kimi está configurado (plataforma). false = anónimo. */
export const kimiAuthEnabled = Boolean(env.appId && env.kimiAuthUrl);
