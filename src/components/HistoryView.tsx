import { ShieldAlert, ShieldCheck, Trash2, Clock, Loader2, AlertCircle, MessageSquare, Mail } from "lucide-react";
import type { AnalysisRecord, MessageType } from "@/types/analysis";

interface HistoryViewProps {
  history: AnalysisRecord[];
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
  onRetry: () => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function typeIcon(type: MessageType) {
  if (type === "email") return <Mail className="h-3.5 w-3.5" />;
  if (type === "sms") return <MessageSquare className="h-3.5 w-3.5" />;
  return <MessageSquare className="h-3.5 w-3.5" />;
}

export function HistoryView({ history, loading, error, onDelete, onRetry }: HistoryViewProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center backdrop-blur">
        <Loader2 className="mx-auto h-7 w-7 spin-slow text-sky-400" />
        <p className="mt-3 text-sm text-slate-400">Loading your analysis history…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-6 backdrop-blur">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Couldn't load history</p>
            <p className="mt-1 text-sm text-red-300/80">{error}</p>
            <button
              onClick={onRetry}
              className="mt-3 rounded-lg border border-red-900/60 bg-red-900/20 px-3 py-1.5 text-sm text-red-200 transition hover:bg-red-900/40"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center backdrop-blur">
        <Clock className="mx-auto h-8 w-8 text-slate-600" />
        <p className="mt-3 font-medium text-slate-300">No analyses yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Analyze a message and it will show up here.
        </p>
      </div>
    );
  }

  const suspiciousCount = history.filter((r) => r.verdict === "suspicious").length;
  const safeCount = history.length - suspiciousCount;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-slate-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-white">{history.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-emerald-500/70">Safe-looking</p>
          <p className="mt-1 text-2xl font-bold text-emerald-300">{safeCount}</p>
        </div>
        <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-4 backdrop-blur">
          <p className="text-xs uppercase tracking-wider text-red-500/70">Suspicious</p>
          <p className="mt-1 text-2xl font-bold text-red-300">{suspiciousCount}</p>
        </div>
      </div>

      {/* Records */}
      <div className="space-y-3">
        {history.map((record, idx) => {
          const isSuspicious = record.verdict === "suspicious";
          return (
            <div
              key={record.id}
              className="animate-fade-slide rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur sm:p-5"
              style={{ animationDelay: `${Math.min(idx * 40, 300)}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {isSuspicious ? (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/15">
                      <ShieldAlert className="h-5 w-5 text-red-400" />
                    </div>
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                    </div>
                  )}
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        isSuspicious ? "text-red-300" : "text-emerald-300"
                      }`}
                    >
                      {isSuspicious ? "Suspicious" : "Safe-looking"}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        {typeIcon(record.message_type)}
                        <span className="capitalize">{record.message_type}</span>
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(record.created_at)}
                      </span>
                      <span>·</span>
                      <span>risk {record.risk_score}/100</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(record.id)}
                  className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-800 hover:text-red-400"
                  aria-label="Delete analysis"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-3 line-clamp-3 rounded-lg bg-slate-950/50 px-3 py-2 text-sm text-slate-300">
                {record.message}
              </p>

              {Array.isArray(record.reasons) && record.reasons.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {record.reasons.slice(0, 3).map((reason, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-slate-800/60 px-2 py-1 text-xs text-slate-400"
                    >
                      {reason}
                    </span>
                  ))}
                  {record.reasons.length > 3 && (
                    <span className="rounded-md bg-slate-800/60 px-2 py-1 text-xs text-slate-500">
                      +{record.reasons.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
