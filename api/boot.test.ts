import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("anonymous mode", () => {
  it("loads the app and rejects OAuth when Kimi auth is not configured", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("APP_ID", "");
    vi.stubEnv("KIMI_AUTH_URL", "");
    vi.resetModules();

    const { default: app } = await import("./boot");
    const response = await app.request("/api/oauth/callback");

    expect(response.status).toBe(501);
    await expect(response.json()).resolves.toEqual({
      error: "auth disabled (anonymous mode)",
    });
  });
});

describe("deployment under a base path", () => {
  it("serves the API under BASE_PATH and allows the configured origin", async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("BASE_PATH", "/21weeks/");
    vi.stubEnv("CORS_ORIGINS", "https://ismos.xyz");
    vi.resetModules();

    const { default: app } = await import("./boot");

    const health = await app.request("/21weeks/api/health", {
      headers: { Origin: "https://ismos.xyz" },
    });
    expect(health.status).toBe(200);
    expect(health.headers.get("access-control-allow-origin")).toBe(
      "https://ismos.xyz"
    );

    const outside = await app.request("/api/health");
    expect(outside.status).toBe(404);

    const otherOrigin = await app.request("/21weeks/api/health", {
      headers: { Origin: "https://evil.example" },
    });
    expect(otherOrigin.headers.get("access-control-allow-origin")).toBeNull();
  });
});
