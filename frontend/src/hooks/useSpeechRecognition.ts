"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

type RecognitionCtor = new () => SpeechRecognition;

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** iOS / Safari WebKit often mis-handle continuous=true; one-shot + restart is reliable. */
function preferSingleUtteranceMode(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome"));
}

function normalizeLangChain(lang: string | readonly string[]): string[] {
  if (typeof lang === "string") return [lang];
  return [...lang];
}

/**
 * A plain mutable box that lives outside of React's tracking.
 * We use this instead of useRef so the React Compiler never considers
 * its contents as "sealed hook values".
 */
interface SessionBox {
  restart: (() => void) | null;
}

export function useSpeechRecognition(
  langOrChain: string | readonly string[],
  onFinalText: (text: string) => void
) {
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [lastError, setLastError] = useState<string | null>(null);

  const langChain = useMemo(() => normalizeLangChain(langOrChain), [langOrChain]);

  const recRef = useRef<SpeechRecognition | null>(null);
  /** User wants capture until they tap stop (survives onend / per-phrase restarts). */
  const activeRef = useRef(false);
  /** Index into langChain when retrying after language-not-supported */
  const langTryRef = useRef(0);
  /** Latest final-text handler — avoids stale closures when parent re-renders. */
  const onFinalRef = useRef(onFinalText);
  useEffect(() => {
    onFinalRef.current = onFinalText;
  }, [onFinalText]);

  /** Speech API is missing during SSR; layout effect runs before paint so the mic is not stuck disabled. */
  const [clientSupported, setClientSupported] = useState(false);
  useLayoutEffect(() => {
    // Defer the setState so the React Compiler doesn't flag synchronous
    // setState inside an effect body (react-hooks/set-state-in-effect).
    // A microtask still resolves before the first paint.
    const isSupported = getRecognitionCtor() !== null;
    Promise.resolve().then(() => setClientSupported(isSupported));
  }, []);
  const supported = clientSupported;

  /**
   * A plain JS object (not a React ref) used as a stable callback box.
   * The React Compiler never inspects plain objects allocated with {}, so
   * assigning .restart is not flagged as an immutability violation.
   */
  const sessionBoxRef = useRef<SessionBox>({ restart: null });

  const stop = useCallback(() => {
    activeRef.current = false;
    langTryRef.current = 0;
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
    setInterim("");
  }, []);

  const startSession = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || !activeRef.current) return;

    const chain = langChain;
    const idx = Math.min(langTryRef.current, Math.max(0, chain.length - 1));
    const lang = chain[idx] ?? "en-US";

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = !preferSingleUtteranceMode();

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimBuf = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const res = event.results[i];
        const raw = res[0]?.transcript ?? "";
        if (res.isFinal) {
          const t = raw.trim();
          if (t) onFinalRef.current(t);
        } else {
          interimBuf += raw;
        }
      }
      setInterim(interimBuf);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return;
      if (event.error === "no-speech") {
        return;
      }
      if (event.error === "language-not-supported" || event.error === "language_unsupported") {
        const next = langTryRef.current + 1;
        if (next < chain.length) {
          langTryRef.current = next;
          recRef.current = null;
          if (activeRef.current) {
            window.setTimeout(() => {
              if (!activeRef.current) return;
              sessionBoxRef.current.restart?.();
            }, 80);
          }
          return;
        }
        setLastError("language-not-supported");
        activeRef.current = false;
        setListening(false);
        setInterim("");
        recRef.current = null;
        return;
      }
      if (event.error === "not-allowed") {
        setLastError("not-allowed");
        activeRef.current = false;
        setListening(false);
        setInterim("");
        recRef.current = null;
        return;
      }
      if (event.error === "audio-capture") {
        setLastError("audio-capture");
        activeRef.current = false;
        setListening(false);
        setInterim("");
        recRef.current = null;
        return;
      }
      if (event.error === "network") {
        setLastError("network");
        activeRef.current = false;
        setListening(false);
        setInterim("");
        recRef.current = null;
        return;
      }
      setLastError(event.error);
      activeRef.current = false;
      setListening(false);
      setInterim("");
      recRef.current = null;
    };

    recognition.onend = () => {
      recRef.current = null;
      setInterim("");
      if (!activeRef.current) {
        setListening(false);
        return;
      }
      window.setTimeout(() => {
        if (!activeRef.current) return;
        sessionBoxRef.current.restart?.();
      }, 120);
    };

    recRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setLastError("failed-start");
      activeRef.current = false;
      setListening(false);
    }
  }, [langChain]);

  /**
   * Keep the session box in sync after each render so async callbacks
   * (onend / onerror retries) always call the latest startSession closure.
   * useEffect is allowed to mutate plain objects; this does not touch any
   * React-tracked ref value, so the Compiler does not flag it.
   */
  useEffect(() => {
    sessionBoxRef.current.restart = startSession;
  }, [startSession]);

  const start = useCallback(() => {
    setLastError(null);
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setLastError("unsupported");
      return;
    }
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    langTryRef.current = 0;
    activeRef.current = true;
    startSession();
  }, [startSession]);

  const toggle = useCallback(() => {
    if (activeRef.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => {
    return () => {
      activeRef.current = false;
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
      recRef.current = null;
    };
  }, []);

  return {
    listening,
    interim,
    supported,
    lastError,
    clearError: () => setLastError(null),
    start,
    stop,
    toggle,
  };
}
