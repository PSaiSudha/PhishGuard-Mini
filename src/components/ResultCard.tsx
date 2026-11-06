import { ShieldAlert, ShieldCheck, Loader2 } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";

interface ResultCardProps {
  result: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-red-400";
  if (score >= 50) return "text-orange-400";
  if (score >= 25) return "text-amber-400";
  return "text-emerald-400";
}

function ringColor(score: number): string {
  if (score >= 50) return "ring-red-500/40";
  return "ring-emerald-500/40";
}

export function ResultCard({ result, loading, error }: ResultCardProps) {
  if (loading) {
    return (
      <div className="animate-fade-slide rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-6 w-6 spin-slow text-sky-400" />
          <span className="text-lg font-medium">Analyzing your message…</span>
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-3 w-2/3 rounded-full bg-slate-800 animate-pulse" />
          <div className="h-3 w-1/2 rounded-full bg-slate-800 animate-pulse" />
          <div className="h-3 w-3/4 rounded-full bg-slate-800 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-slide rounded-2xl border border-red-900/60 bg-red-950/40 p-6 backdrop-blur">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-red-400" />
          <div>
            <p className="font-semibold text-red-200">Something went wrong</p>
            <p className="mt-1 text-sm text-red-300/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isSuspicious = result.verdict === "suspicious";

  return (
    <div
      className={`animate-fade-slide rounded-2xl border bg-slate-900/60 p-6 backdrop-blur ring-1 ${ringColor(
        result.risk_score
      )} ${
        isSuspicious ? "border-red-900/60" : "border-emerald-900/60"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isSuspicious ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/15 pulse-ring">
              <ShieldAlert className="h-7 w-7 text-red-400" />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15">
              <ShieldCheck className="h-7 w-7 text-emerald-400" />
            </div>
          )}
          <div>
            <p
              className={`text-xl font-bold ${
                isSuspicious ? "text-red-300" : "text-emerald-300"
              }`}
            >
              {isSuspicious ? "Suspicious" : "Safe-looking"}
            </p>
            <p className="text-sm text-slate-400">
              {isSuspicious
                ? "This message shows several phishing warning signs."
                : "No strong phishing signals were detected."}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-slate-500">Risk score</p>
          <p className={`text-3xl font-bold ${scoreColor(result.risk_score)}`}>
            {result.risk_score}
            <span className="text-base text-slate-500">/100</span>
          </p>
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            isSuspicious
              ? "bg-gradient-to-r from-amber-500 to-red-500"
              : "bg-gradient-to-r from-emerald-500 to-sky-500"
          }`}
          style={{ width: `${result.risk_score}%` }}
        />
      </div>

      {/* Reasons */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-300">Why this verdict?</p>
        <ul className="mt-3 space-y-2">
          {result.reasons.map((reason, i) => (
            <li
              key={i}
              className="flex items-start gap-2 rounded-lg bg-slate-800/50 px-3 py-2 text-sm text-slate-300"
            >
              <span
                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                  isSuspicious ? "bg-red-400" : "bg-emerald-400"
                }`}
              />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-5 rounded-lg bg-slate-800/40 px-3 py-2 text-xs text-slate-500">
        This is an automated assessment, not a guarantee. Always use your own
        judgement — when in doubt, don't click links or share personal details.
      </p>
    </div>
  );
}
