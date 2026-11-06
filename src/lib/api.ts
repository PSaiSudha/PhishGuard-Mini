import { supabase } from "@/lib/supabase";
import type { AnalysisResult, AnalysisRecord, MessageType } from "@/types/analysis";

const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-phishing`;

export async function analyzeMessage(
  message: string,
  messageType: MessageType = "text"
): Promise<AnalysisResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData?.session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

  const resp = await fetch(functionUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, message_type: messageType }),
  });

  if (!resp.ok) {
    let detail = `Request failed (${resp.status})`;
    try {
      const body = await resp.json();
      if (body?.error) detail = body.error;
    } catch {
      /* ignore parse errors */
    }
    throw new Error(detail);
  }

  const data = await resp.json();
  if (
    typeof data?.verdict !== "string" ||
    typeof data?.risk_score !== "number" ||
    !Array.isArray(data?.reasons)
  ) {
    throw new Error("Received an unexpected response from the analyzer.");
  }

  const result: AnalysisResult = {
    verdict: data.verdict,
    risk_score: data.risk_score,
    reasons: data.reasons as string[],
    matched_signals: Array.isArray(data.matched_signals) ? data.matched_signals : [],
  };

  // Persist to history using the authenticated session (user_id is filled by
  // the DEFAULT auth.uid() on the table).
  const { error: insertError } = await supabase.from("phishguard_analyses").insert({
    message,
    verdict: result.verdict,
    risk_score: result.risk_score,
    reasons: result.reasons,
    message_type: messageType,
  });
  if (insertError) {
    // Surface a soft warning but don't throw — the user still got their verdict.
    console.warn("Failed to save analysis to history:", insertError.message);
  }

  return result;
}

export async function fetchHistory(limit = 50): Promise<AnalysisRecord[]> {
  const { data, error } = await supabase
    .from("phishguard_analyses")
    .select("id, message, verdict, risk_score, reasons, message_type, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as AnalysisRecord[];
}

export async function deleteAnalysis(id: string): Promise<void> {
  const { error } = await supabase.from("phishguard_analyses").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
