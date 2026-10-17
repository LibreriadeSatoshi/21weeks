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
