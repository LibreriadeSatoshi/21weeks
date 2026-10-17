// Rutas de la app según dónde se despliegue.
// BASE_PATH (build) fija el prefijo, p. ej. "/21weeks/" para ismos.xyz/21weeks.
// VITE_API_URL apunta la API a otro origen (p. ej. https://app.ismos.xyz/21weeks/api)
// para no pasar por el proxy de Netlify, que corta a los 26 s.

/** Prefijo de la app, siempre con "/" final ("/" en local). */
export const BASE_URL = import.meta.env.BASE_URL;

/** basename para React Router ("" en local). */
export const ROUTER_BASENAME = BASE_URL.replace(/\/$/, "");

/** URL base de la API, sin "/" final. */
export const API_URL = (
  import.meta.env.VITE_API_URL || `${BASE_URL}api`
).replace(/\/$/, "");

/** Ruta a un fichero de public/ respetando el prefijo. */
export function asset(path: string): string {
  return `${BASE_URL}${path.replace(/^\//, "")}`;
}
