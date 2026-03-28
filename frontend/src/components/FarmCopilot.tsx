"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { speechLangChainFor } from "@/lib/i18n";
import { askFarmCopilot } from "@/services/api";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function FarmCopilot() {
  const { t, locale, isRtl } = useLocale();
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendVoice = useCallback((chunk: string) => {
    setQ((prev) => {
      const p = prev.trimEnd();
      return p ? `${p} ${chunk}` : chunk;
    });
  }, []);

  const speechLangChain = useMemo(() => speechLangChainFor(locale), [locale]);
  const {
    listening,
    interim,
    supported,
    lastError,
    clearError,
    toggle,
    stop: stopVoice,
  } = useSpeechRecognition(speechLangChain, appendVoice);

  useEffect(() => {
    stopVoice();
  }, [locale, stopVoice]);

  const voiceErrorLabel = useMemo(() => {
    if (!lastError) return null;
    if (lastError === "unsupported") return t("copilotVoiceNotSupported");
    if (lastError === "not-allowed") return t("copilotVoicePermission");
    if (lastError === "network") return t("copilotVoiceNetwork");
    if (lastError === "audio-capture") return t("copilotVoiceMic");
    if (lastError === "failed-start") return t("copilotVoiceStartFail");
    if (lastError === "language-not-supported") return t("copilotVoiceLangUnsupported");
    return t("copilotVoiceError");
  }, [lastError, t]);

  const submit = async () => {
    const text = q.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    stopVoice();
    try {
      const a = await askFarmCopilot(text, locale);
      setAnswer(a);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(
        msg.toLowerCase().includes("llm") || msg.toLowerCase().includes("api key")
          ? t("copilotOffline")
          : t("copilotError")
      );
    } finally {
      setLoading(false);
    }
  };

  const onVoiceClick = () => {
    clearError();
    toggle();
  };

  return (
    <section
      id="farm-copilot"
      className="glass-card animate-fade-in-up delay-100"
      style={{ padding: 20, marginBottom: 20, borderColor: "rgba(74, 222, 128, 0.25)" }}
    >
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", marginBottom: 6 }}>
          💬 {t("copilotTitle")}
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: 0 }}>
          {t("copilotSubtitle")}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "stretch",
          marginBottom: 6,
          flexDirection: isRtl ? "row-reverse" : "row",
        }}
      >
        <textarea
          dir={isRtl ? "rtl" : "ltr"}
          value={q}
          onChange={(e) => {
            if (listening) stopVoice();
            setQ(e.target.value);
          }}
          placeholder={t("copilotPlaceholder")}
          rows={3}
          disabled={loading}
          style={{
            flex: 1,
            resize: "vertical",
            minHeight: 88,
            padding: 12,
            borderRadius: 14,
            border: "1px solid var(--border-bright)",
            background: "rgba(255,255,255,0.04)",
            color: "var(--text-primary)",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        />
        <button
          type="button"
          title={listening ? t("copilotVoiceStop") : t("copilotVoiceStart")}
          onClick={onVoiceClick}
          disabled={loading || !supported}
          className={listening ? "btn-secondary" : "btn-ghost"}
          style={{
            flexShrink: 0,
            width: 52,
            minHeight: 88,
            borderRadius: 14,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            borderColor: listening ? "rgba(248,113,113,0.45)" : undefined,
            opacity: !supported ? 0.45 : 1,
          }}
          aria-pressed={listening}
        >
          <MicIcon active={listening} />
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)" }}>
            {listening ? t("copilotVoiceStop") : t("copilotVoiceStart")}
          </span>
        </button>
      </div>

      {listening && (
        <p style={{ fontSize: 12, color: "var(--green-400)", marginBottom: interim ? 4 : 10, marginTop: 0 }}>
          ● {t("copilotVoiceListening")}
        </p>
      )}
      {listening && interim.trim() ? (
        <p
          dir={isRtl ? "rtl" : "ltr"}
          style={{
            fontSize: 13,
            color: "var(--text-dim)",
            fontStyle: "italic",
            marginBottom: 10,
            marginTop: 0,
            lineHeight: 1.45,
          }}
        >
          {interim}
        </p>
      ) : null}

      {voiceErrorLabel && (
        <p style={{ fontSize: 12, color: "var(--warning)", marginBottom: 10, lineHeight: 1.45 }}>
          {voiceErrorLabel}
        </p>
      )}

      <button
        type="button"
        className="btn-primary"
        style={{ maxWidth: 220 }}
        disabled={loading || !q.trim()}
        onClick={submit}
      >
        {loading ? t("copilotThinking") : t("copilotSend")}
      </button>

      {error && (
        <p style={{ marginTop: 14, fontSize: 13, color: "var(--danger)", lineHeight: 1.5 }}>{error}</p>
      )}

      {answer && (
        <div
          style={{
            marginTop: 16,
            padding: 14,
            borderRadius: 14,
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--green-400)", marginBottom: 8 }}>
            {t("headerTitle")}
          </p>
          <div
            dir={isRtl ? "rtl" : "ltr"}
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              lineHeight: 1.75,
              whiteSpace: "pre-wrap",
            }}
          >
            {answer}
          </div>
        </div>
      )}
    </section>
  );
}

function MicIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        fill={active ? "var(--danger)" : "currentColor"}
        d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"
      />
    </svg>
  );
}
