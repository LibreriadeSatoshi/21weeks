import { afterEach, describe, expect, it, vi } from "vitest";
import { ACCESS_COOKIE, accessToken } from "./site-gate";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

async function lockedApp() {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("BASE_PATH", "/21weeks/");
  vi.stubEnv("SITE_PASSWORD", "satoshi");
  vi.stubEnv("COOKIE_DOMAIN", "ismos.xyz");
  vi.stubEnv("CORS_ORIGINS", "https://ismos.xyz");
  vi.resetModules();
  const { default: app } = await import("../boot");
  return app;
}

function login(
  app: Awaited<ReturnType<typeof lockedApp>>,
  password: string,
  next: string
) {
  return app.request("/21weeks/__access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password, next }).toString(),
  });
}

describe("site gate", () => {
  it("shows the access page instead of the app and keeps crawlers out", async () => {
    const app = await lockedApp();
    const res = await app.request("/21weeks/projects", {
      headers: { Accept: "text/html" },
    });

    expect(res.status).toBe(401);
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    const html = await res.text();
    expect(html).toContain("Password protected site");
    expect(html).not.toContain("21 Weeks");
    expect(html).not.toContain("ISMOS");
    expect(html).toContain('value="/21weeks/projects"');
  });

  it("locks the API but leaves the health check and CORS preflight open", async () => {
    const app = await lockedApp();

    expect((await app.request("/21weeks/api/trpc/ping")).status).toBe(401);
    expect((await app.request("/21weeks/api/health")).status).toBe(200);

    const preflight = await app.request("/21weeks/api/trpc/ping", {
      method: "OPTIONS",
      headers: {
        Origin: "https://ismos.xyz",
        "Access-Control-Request-Method": "GET",
      },
    });
    expect(preflight.status).toBeLessThan(300);
    expect(preflight.headers.get("access-control-allow-origin")).toBe(
      "https://ismos.xyz"
    );
  });

  it("rejects a wrong password", async () => {
    const app = await lockedApp();
    const res = await login(app, "nope", "/21weeks/");

    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
    expect(await res.text()).toContain("Incorrect password");
  });

  it("sets a shared cookie on the right password and then lets requests through", async () => {
    const app = await lockedApp();
    const res = await login(app, "satoshi", "/21weeks/plan");

    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("/21weeks/plan");
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${ACCESS_COOKIE}=${accessToken("satoshi")}`);
    expect(cookie).toContain("Domain=ismos.xyz");
    expect(cookie).toContain("HttpOnly");

    const api = await app.request("/21weeks/api/trpc/ping", {
      headers: { Cookie: `${ACCESS_COOKIE}=${accessToken("satoshi")}` },
    });
    expect(api.status).toBe(200);
  });

  it("only redirects to paths inside the app", async () => {
    const app = await lockedApp();
    const res = await login(app, "satoshi", "//evil.example/");

    expect(res.headers.get("location")).toBe("/21weeks/");
  });

  it("does not accept a cookie made with another password", async () => {
    const app = await lockedApp();
    const res = await app.request("/21weeks/api/trpc/ping", {
      headers: { Cookie: `${ACCESS_COOKIE}=${accessToken("old-password")}` },
    });

    expect(res.status).toBe(401);
  });
});
