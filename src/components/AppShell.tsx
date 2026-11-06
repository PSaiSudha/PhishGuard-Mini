import { useState } from "react";
import { ShieldCheck, Sparkles, Mail, MessageSquare, History as HistoryIcon, ArrowLeft, LogOut } from "lucide-react";
import { analyzeMessage, fetchHistory, deleteAnalysis } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ResultCard } from "@/components/ResultCard";
import { HistoryView } from "@/components/HistoryView";
import type { AnalysisResult, AnalysisRecord, MessageType } from "@/types/analysis";

const SAMPLES: { label: string; type: MessageType; text: string }[] = [
  {
    label: "Suspicious SMS",
    type: "sms",
    text: "URGENT: Your account has been suspended. Verify your identity immediately at http://bit.ly/secure-verify or your account will be closed within 24 hours.",
  },
  {
    label: "Suspicious email",
    type: "email",
    text: "Dear Customer, We detected unusual activity on your account. Please confirm your identity and update your payment details by clicking here: http://192.168.0.5/login. Failure to do so will result in account termination.",
  },
  {
    label: "Safe-looking message",
    type: "email",
    text: "Hi team, Just a reminder that our weekly project sync is moved to Thursday at 3pm. I've attached the updated agenda. Let me know if you have any questions. Thanks, Alex",
  },
];

type View = "home" | "history";

export function AppShell() {
  const { user, signOut } = useAuth();
  const [view, setView] = useState<View>("home");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("text");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History state
  const [history, setHistory] = useState<AnalysisRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  async function handleAnalyze() {
    if (message.trim().length === 0) {
      setError("Please enter a message to analyze.");
      setResult(null);
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await analyzeMessage(message, messageType);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze message.");
    } finally {
      setLoading(false);
    }
  }

  async function handleViewHistory() {
    setView("history");
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const records = await fetchHistory();
      setHistory(records);
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Failed to load history.");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteAnalysis(id);
      setHistory((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setHistoryError(err instanceof Error ? err.message : "Failed to delete record.");
    }
  }

  function loadSample(sample: (typeof SAMPLES)[number]) {
    setMessage(sample.text);
    setMessageType(sample.type);
    setResult(null);
    setError(null);
  }

  function backHome() {
    setView("home");
  }

  const userEmail = user?.email ?? "";
  const initials = userEmail.charAt(0).toUpperCase() || "?";

  return (
    <div className="relative min-h-screen">
      <div className="aurora-bg" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-5 py-8 sm:px-6">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 shadow-lg shadow-blue-900/40">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">
                PhishGuard <span className="text-sky-400">Mini</span>
              </h1>
              <p className="text-xs text-slate-500">AI phishing message detection</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {view === "home" ? (
              <button
                onClick={handleViewHistory}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800/70 hover:text-white"
              >
                <HistoryIcon className="h-4 w-4" />
                <span className="hidden sm:inline">History</span>
              </button>
            ) : (
              <button
                onClick={backHome}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:border-slate-700 hover:bg-slate-800/70 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            {/* Account + sign out */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-xs font-bold text-white">
                {initials}
              </div>
              <span className="hidden max-w-[140px] truncate text-xs text-slate-400 sm:inline" title={userEmail}>
                {userEmail}
              </span>
              <button
                onClick={() => signOut()}
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-red-400"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {view === "home" ? (
          <main className="flex-1">
            {/* Hero */}
            <div className="mb-7 text-center">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/50 px-3 py-1 text-xs text-slate-400">
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                Paste any SMS or email — get an instant phishing risk read
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Is that message safe to trust?
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
                PhishGuard scans your message for the most common phishing tactics —
                suspicious links, urgency cues, credential requests, and more —
                then tells you whether it looks safe or suspicious.
              </p>
            </div>

            {/* Input card */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur sm:p-6">
              {/* Type selector */}
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => setMessageType("text")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    messageType === "text"
                      ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30"
                      : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  Text
                </button>
                <button
                  onClick={() => setMessageType("sms")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    messageType === "sms"
                      ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30"
                      : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  SMS
                </button>
                <button
                  onClick={() => setMessageType("email")}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    messageType === "email"
                      ? "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30"
                      : "bg-slate-800/50 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </button>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Paste an SMS or email message here…"
                rows={6}
                className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-sky-600/60 focus:ring-2 focus:ring-sky-500/20"
              />

              <div className="mt-4 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">
                  {message.length.toLocaleString()} characters
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-sky-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {loading ? "Analyzing…" : "Analyze message"}
                </button>
              </div>
            </div>

            {/* Samples */}
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                Try a sample
              </p>
              <div className="flex flex-wrap gap-2">
                {SAMPLES.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => loadSample(s)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-400 transition hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-200"
                  >
                    <Sparkles className="h-3 w-3 text-sky-400" />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            <div className="mt-6">
              <ResultCard result={result} loading={loading} error={error} />
            </div>
          </main>
        ) : (
          <main className="flex-1">
            <HistoryView
              history={history}
              loading={historyLoading}
              error={historyError}
              onDelete={handleDelete}
              onRetry={handleViewHistory}
            />
          </main>
        )}

        {/* Footer */}
        <footer className="mt-10 border-t border-slate-800/60 pt-5 text-center text-xs text-slate-600">
          PhishGuard Mini — automated phishing risk assessment. Results are
          guidance only and not a guarantee of safety.
        </footer>
      </div>
    </div>
  );
}
