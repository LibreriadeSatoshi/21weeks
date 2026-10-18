import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { PROJECTS } from "@contracts/types";
import { ArrowRight, Refresh } from "iconoir-react";
import { useI18n, type TKey } from "@/i18n";
import { useAppState } from "@/state";
import {
  AiLabel,
  ExternalLink,
  Notice,
  QuarterHeader,
} from "@/components/ismos";
import { API_URL } from "@/lib/paths";

export default function Mentor() {
  const { t, locale } = useI18n();
  const { profile, projectId, plan, chat, setChat } = useAppState();
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const project = PROJECTS.find(p => p.id === projectId) ?? null;

  // prefill from "ask the mentor" in the plan
  useEffect(() => {
    const draft = localStorage.getItem("oss21.mentorDraft");
    if (draft) {
      setInput(draft);
      localStorage.removeItem("oss21.mentorDraft");
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, streaming]);

  const send = async () => {
    const content = input.trim();
    if (!content || streaming) return;
    setError(false);
    setInput("");
    const next = [...chat, { role: "user" as const, content }];
    setChat(next);
    setStreaming(true);

    try {
      const res = await fetch(`${API_URL}/mentor/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          profile,
          projectId: project?.id ?? null,
          messages: next.slice(-20),
        }),
      });
      if (!res.ok || !res.body) throw new Error("chat failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setChat([...next, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setChat([...next, { role: "assistant", content: snapshot }]);
      }
      if (!acc.trim()) throw new Error("empty stream");
    } catch {
      setInput(current => current || content);
      setChat(chat);
      setError(true);
    } finally {
      setStreaming(false);
    }
  };

  const context = [
    profile &&
      t(
        `quiz.role.${profile.role === "developer" ? "dev" : "research"}` as TKey
      ),
    profile && t(`quiz.level.${profile.level}` as TKey),
    profile && `${profile.hoursPerWeek} ${t("quiz.hours.unit")}`,
    project?.name,
    plan && t("mentor.context.plan").replace("{n}", String(plan.weeks.length)),
  ].filter(Boolean);

  return (
    <>
      <QuarterHeader
        label={t("mentor.eyebrow")}
        title={t("mentor.title")}
        lead={t("mentor.sub")}
      >
        {context.length > 0 && (
          <p className="ism-t-caption m-0">
            <span className="ism-label me-8">{t("mentor.context")}</span>
            {context.join(" · ")}
          </p>
        )}
        <p className="ism-t-body-small m-0">
          <ExternalLink href="https://bitcoinknowledge.dev/">
            {t("mentor.sources")}
          </ExternalLink>
        </p>
      </QuarterHeader>

      <div className="app-container pb-64">
        <div className="max-w-reading">
          <div
            className="flex flex-col border-t-2 border-rule-strong"
            aria-live="polite"
          >
            {chat.length === 0 && (
              <p className="ism-t-body text-text-muted py-32 m-0">
                {t("mentor.empty")}
              </p>
            )}
            {chat.map((m, i) => (
              <article
                key={i}
                className="py-24 border-b-1 border-hairline flex flex-col gap-8"
              >
                <p className="m-0 flex flex-wrap items-center gap-12">
                  <span className="ism-label">
                    {m.role === "user" ? t("mentor.you") : t("mentor.eyebrow")}
                  </span>
                  {m.role === "assistant" && (
                    <AiLabel>{t("common.builtWithAi")}</AiLabel>
                  )}
                </p>
                {m.role === "assistant" ? (
                  <div className="ism-t-body md-chat">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                    {streaming && i === chat.length - 1 && (
                      <span className="chat-caret" />
                    )}
                  </div>
                ) : (
                  <p className="ism-t-body m-0 whitespace-pre-wrap">
                    {m.content}
                  </p>
                )}
              </article>
            ))}
            {streaming && chat[chat.length - 1]?.role === "user" && (
              <p
                className="ism-t-body-small text-text-muted py-16 m-0"
                role="status"
              >
                {t("mentor.thinking")}
              </p>
            )}
            {error && (
              <div className="py-16 flex flex-col gap-12">
                <Notice tone="alert" word={t("common.alert")}>
                  {t("mentor.error.quota")}
                </Notice>
                <div>
                  <button
                    type="button"
                    onClick={send}
                    className="ism-btn ism-btn--secondary"
                  >
                    <Refresh width={20} height={20} aria-hidden="true" />
                    {t("common.retry")}
                  </button>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className="sticky bottom-0 bg-surface py-16 border-t-1 border-hairline flex flex-col gap-8"
            onSubmit={e => {
              e.preventDefault();
              send();
            }}
          >
            <div className="ism-field">
              <label htmlFor="mentor-input">{t("mentor.inputLabel")}</label>
              <div className="flex gap-12">
                <input
                  id="mentor-input"
                  className="ism-field__input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t("mentor.placeholder")}
                />
                <button
                  type="submit"
                  disabled={streaming || !input.trim()}
                  className="ism-btn shrink-0"
                >
                  {t("mentor.send")}
                  <ArrowRight width={20} height={20} aria-hidden="true" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
