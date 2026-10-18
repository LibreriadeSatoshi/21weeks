// App paths depending on where it is deployed.
// BASE_PATH (build) sets the prefix, e.g. "/21weeks/" for ismos.xyz/21weeks.
// VITE_API_URL points the API at another origin (e.g. https://app.ismos.xyz/21weeks/api)
// to avoid the Netlify proxy, which cuts off at 26 s.

/** App prefix, always with a trailing "/" ("/" locally). */
export const BASE_URL = import.meta.env.BASE_URL;

/** basename for React Router ("" locally). */
export const ROUTER_BASENAME = BASE_URL.replace(/\/$/, "");

/** API base URL, without a trailing "/". */
export const API_URL = (
  import.meta.env.VITE_API_URL || `${BASE_URL}api`
).replace(/\/$/, "");

/** Path to a file in public/ respecting the prefix. */
export function asset(path: string): string {
  return `${BASE_URL}${path.replace(/^\//, "")}`;
}
