export type Verdict = "safe" | "suspicious";
export type MessageType = "text" | "sms" | "email";

export interface AnalysisResult {
  verdict: Verdict;
  risk_score: number;
  reasons: string[];
  matched_signals: string[];
}

export interface AnalysisRecord {
  id: string;
  message: string;
  verdict: Verdict;
  risk_score: number;
  reasons: string[];
  message_type: MessageType;
  created_at: string;
}
