"use client";

import { useLocale } from "@/contexts/LocaleContext";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { speechLangChainFor } from "@/lib/i18n";
import { askFarmCopilot } from "@/services/api";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { 
  MessageSquare, 
  Mic, 
  MicOff, 
  Send, 
  Loader2, 
  Sparkles,
  AlertCircle,
  Download,
  Bot,
  User
} from "lucide-react";
import { downloadPdfFromHtml } from "@/lib/downloadPdf";
import { generateReportHtml } from "@/lib/pdfGenerator";

interface Message {
  role: 'bot' | 'user';
  content: string;
  isPdfAvailable?: boolean;
}

export default function FarmCopilot() {
  const { t, locale, isRtl } = useLocale();
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: t("welcomeMessage") }
  ]);
  const [loading, setLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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

  const submit = async () => {
    const text = q.trim();
    if (loading || !text) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setQ("");
    setLoading(true);
    setError(null);
    stopVoice();

    try {
      const a = await askFarmCopilot(text, locale);
      setMessages(prev => [...prev, { role: 'bot', content: a, isPdfAvailable: true }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      const errorMsg = msg.toLowerCase().includes("llm") || msg.toLowerCase().includes("api key")
          ? t("copilotOffline")
          : t("copilotError");
      setError(errorMsg);
      setMessages(prev => [...prev, { role: 'bot', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (msg: string, userQ: string) => {
    setIsDownloading(true);
    try {
      const htmlContent = `<strong>Question:</strong><br/>${userQ}<br/><br/><strong>Response:</strong><br/>${msg}`;
      await downloadPdfFromHtml(generateReportHtml("Farm Copilot Report", htmlContent), "DrCrop-Copilot-Report.pdf");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* Copilot Header */}
      <div className="p-3 sm:p-5 border-b border-surface-container-low flex items-center gap-3 bg-surface">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container">
          <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div>
          <h3 className="font-bold text-on-surface text-base sm:text-lg leading-tight">{t("copilotTitle")}</h3>
          <p className="text-[10px] sm:text-xs text-primary font-medium flex items-center gap-1">
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary inline-block ${loading ? 'animate-pulse' : ''}`}></span> 
            {loading ? t("copilotThinking") : t("badgeOnline")}
          </p>
        </div>
      </div>

      {/* Chat Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 bg-surface-bright custom-scrollbar">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'max-w-[90%]'}`}>
            {msg.role === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container shrink-0 mt-1 shadow-sm">
                <Bot size={16} />
              </div>
            )}
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-primary text-on-primary rounded-tr-sm' 
                : 'bg-surface-container-low text-on-surface rounded-tl-sm border border-outline-variant/10'
            }`}>
              <p className={isRtl ? 'text-right' : 'text-left'}>{msg.content}</p>
              
              {msg.isPdfAvailable && (
                <button
                  onClick={() => {
                    const userMsg = messages.filter(m => m.role === 'user').pop();
                    downloadReport(msg.content, userMsg?.content || "User Question");
                  }}
                  disabled={isDownloading}
                  className="mt-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary hover:text-primary-dim transition-colors"
                >
                  {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  {t("downloadReport")}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 max-w-[90%] animate-pulse">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant shrink-0 mt-1">
              <Bot size={16} />
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl rounded-tl-sm text-sm text-on-surface-variant italic">
              {t("copilotThinking")}
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-surface-container-lowest border-t border-surface-container-low">
        {listening && (
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
            <span className="text-xs text-error font-bold uppercase tracking-tighter">{t("copilotVoiceListening")}</span>
            <span className="text-xs text-on-surface-variant italic truncate">{interim}</span>
          </div>
        )}
        
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input 
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className="w-full bg-surface-container-low border-none rounded-full pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary/20 text-on-surface placeholder-on-surface-variant" 
              placeholder={t("copilotPlaceholder")}
              type="text"
            />
            <button 
              onClick={submit}
              disabled={loading || !q.trim()}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-primary text-on-primary rounded-full hover:bg-primary-dim transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <button 
            onClick={toggle}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${listening ? 'bg-error text-on-error animate-pulse' : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'}`}
          >
            {listening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
        </div>
        {lastError && <p className="text-[10px] text-error mt-2 px-2 font-medium">{t("copilotError")}</p>}
      </div>
    </div>
  );
}

