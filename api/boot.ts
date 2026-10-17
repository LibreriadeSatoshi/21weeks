import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { streamText, stepCountIs } from "ai";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env, kimiAuthEnabled } from "./lib/env";
import { siteGate } from "./lib/site-gate";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { PROJECTS, type Locale, type Profile } from "@contracts/types";
import { kimiGw, defaultModelId } from "./ai/provider";
import { classifyAiError } from "./ai/ai-client";
import { mentorSystemPrompt } from "./ai/mentor";
import { knowledgeTools } from "./ai/knowledge";

// Todo cuelga de BASE_PATH (p. ej. /21weeks) para servirse en ismos.xyz/21weeks.
const app = new Hono<{ Bindings: HttpBindings }>().basePath(env.basePath || "/");

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
// La web en ismos.xyz llama a la API directamente (sin el proxy de Netlify).
if (env.corsOrigins.length > 0) {
  app.use("/api/*", cors({ origin: env.corsOrigins, credentials: true }));
}

// Acceso privado hasta el lanzamiento: sin SITE_PASSWORD, el sitio queda abierto.
if (env.sitePassword) {
  app.use(
    "*",
    siteGate({
      password: env.sitePassword,
      basePath: env.basePath,
      cookieDomain: env.cookieDomain || undefined,
      secure: env.isProduction,
    }),
  );
}

app.get("/api/health", (c) => c.json({ ok: true }));

// Login "Sign in with Kimi": solo disponible dentro de la plataforma Kimi.
// Fuera de ella (servidor propio) la app corre en modo anónimo.
app.get(Paths.oauthCallback, async (c) => {
  if (!kimiAuthEnabled) return c.json({ error: "auth disabled (anonymous mode)" }, 501);
  return createOAuthCallbackHandler()(c);
});

// Chat streaming del mentor (texto plano por chunk; el frontend lo acumula)
app.post("/api/mentor/chat", async (c) => {
  try {
    const body = (await c.req.json()) as {
      locale: Locale;
      profile: Profile | null;
      projectId: string | null;
      messages: { role: "user" | "assistant"; content: string }[];
    };
    const project = body.projectId
      ? (PROJECTS.find((p) => p.id === body.projectId) ?? null)
      : null;
    const result = streamText({
      model: kimiGw()(await defaultModelId()),
      system: mentorSystemPrompt(body.locale ?? "es", body.profile, project),
      messages: body.messages.slice(-20),
      tools: knowledgeTools,
      stopWhen: stepCountIs(5),
      providerOptions: { "kimi-gw": { max_completion_tokens: 2500 } },
    });
    return result.toTextStreamResponse();
  } catch (err) {
    const classified = classifyAiError(err);
    return c.json({ error: classified.name, message: classified.message }, 500);
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: `${env.basePath}/api/trpc`,
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app, env.basePath);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
