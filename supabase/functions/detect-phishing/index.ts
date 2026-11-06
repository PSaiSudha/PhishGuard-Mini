// PhishGuard Mini — phishing message detection edge function.
// Receives a message (SMS/email), runs a heuristic + lexical classifier,
// returns a verdict (safe/suspicious), a 0-100 risk score, and reasons.
// Optionally persists the analysis to the phishguard_analyses table.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// --- Weighted signal catalogue -------------------------------------------------
// Each signal carries a weight (points added to the risk score when matched)
// and a human-readable reason. Weights are tuned so a handful of strong
// signals push a message into "suspicious" territory (>= 50).

interface Signal {
  id: string;
  weight: number;
  reason: string;
  test: (text: string, lower: string) => boolean;
}

// Curated lists. Matching is case-insensitive on a normalized copy of the text.
const SUSPICIOUS_PHRASES = [
  "verify your account",
  "confirm your identity",
  "account has been suspended",
  "account has been locked",
  "account is locked",
  "unusual activity",
  "suspicious activity",
  "update your payment",
  "update your billing",
  "validate your account",
  "your account will be closed",
  "your account will be terminated",
  "immediate action",
  "action required",
  "final notice",
  "dear customer",
  "dear user",
  "dear valued customer",
  "congratulations you have won",
  "you have been selected",
  "claim your prize",
  "claim your reward",
  "you are a winner",
  "wire transfer",
  "tax refund",
  "irs",
  "social security number",
  "delivery failure",
  "package is waiting",
  "parcel is on hold",
  "reset your password",
  "security alert",
  "login attempt",
  "billing error",
  "overdue invoice",
  "your payment was declined",
];

const URGENCY_WORDS = [
  "urgent",
  "immediately",
  "asap",
  "right now",
  "within 24 hours",
  "within 48 hours",
  "today only",
  "act now",
  "expires today",
  "final reminder",
  "last warning",
  "last chance",
  "limited time",
  "before it's too late",
  "before its too late",
];

const MONEY_WORDS = [
  "win",
  "winner",
  "won",
  "prize",
  "cash prize",
  "lottery",
  "reward",
  "free money",
  "$1000",
  "$5000",
  "million dollars",
  "inheritance",
  "funds are frozen",
  "transfer fee",
  "processing fee",
  "gift card",
  "bitcoin",
  "crypto",
  "money laundering",
];

const CRED_WORDS = [
  "password",
  "passcode",
  "pin code",
  "otp",
  "credit card",
  "cvv",
  "social security",
  "bank account",
  "routing number",
  "ssn",
  "mother's maiden name",
  "date of birth",
  "login credentials",
];

const signals: Signal[] = [
  {
    id: "url_present",
    weight: 15,
    reason: "Contains a link — phishing messages often embed clickable URLs.",
    test: (_t, l) => /https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|co|info|biz|xyz|top|click|pw|tk|ml|ga|cf)/i.test(l),
  },
  {
    id: "url_shortener",
    weight: 18,
    reason: "Uses a URL shortener, which can hide the real destination.",
    test: (_t, l) => /(bit\.ly|tinyurl|t\.co|goo\.gl|ow\.ly|is\.gd|buff\.ly|rebrand\.ly|cutt\.ly|shorte\.st)/i.test(l),
  },
  {
    id: "ip_url",
    weight: 20,
    reason: "Link points to a raw IP address instead of a domain name.",
    test: (_t, l) => /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(l),
  },
  {
    id: "suspicious_phrase",
    weight: 14,
    reason: "Uses language common in phishing templates (account/identity/billing threats).",
    test: (_t, l) => SUSPICIOUS_PHRASES.some((p) => l.includes(p)),
  },
  {
    id: "urgency",
    weight: 12,
    reason: "Creates a false sense of urgency to rush you into acting.",
    test: (_t, l) => URGENCY_WORDS.some((p) => l.includes(p)),
  },
  {
    id: "money_lure",
    weight: 14,
    reason: "Dangles money, prizes, or rewards — a classic lure.",
    test: (_t, l) => MONEY_WORDS.some((p) => l.includes(p)),
  },
  {
    id: "credential_request",
    weight: 20,
    reason: "Asks for passwords, card numbers, or other sensitive credentials.",
    test: (_t, l) => CRED_WORDS.some((p) => l.includes(p)),
  },
  {
    id: "request_word",
    weight: 6,
    reason: "Uses request language ('please provide/send/confirm your …').",
    test: (_t, l) => /(please|kindly)\s+(provide|send|confirm|verify|update|share)\s+(your|the|details|info)/i.test(l),
  },
  {
    id: "generic_greeting",
    weight: 6,
    reason: "Uses a generic greeting instead of your name.",
    test: (_t, l) => /dear (customer|user|valued client|sir|madam|account holder)/i.test(l),
  },
  {
    id: "excessive_caps",
    weight: 8,
    reason: "Uses excessive capitalization, a tactic to grab attention.",
    test: (t, _l) => {
      const letters = t.replace(/[^A-Za-z]/g, "");
      if (letters.length < 20) return false;
      const caps = (t.match(/[A-Z]/g) || []).length;
      return caps / letters.length > 0.5;
    },
  },
  {
    id: "excessive_exclaim",
    weight: 5,
    reason: "Uses many exclamation marks.",
    test: (t, _l) => (t.match(/!/g) || []).length >= 3,
  },
  {
    id: "phone_number",
    weight: 7,
    reason: "Includes a phone number to call — sometimes used to bypass email filters.",
    test: (_t, l) => /\b(\+?\d{1,2}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/.test(l),
  },
  {
    id: "mismatched_sender_words",
    weight: 8,
    reason: "Claims to be from an official source while pressuring action.",
    test: (_t, l) =>
      /(bank|paypal|apple|google|microsoft|amazon|netflix|facebook|instagram|irs|fedex|ups|dhl|usps)/i.test(l) &&
      /(verify|confirm|suspend|locked|update|security)/i.test(l),
  },
  {
    id: "misspelled_brand",
    weight: 10,
    reason: "Contains a misspelled brand name, a common spoofing trick.",
    test: (_t, l) =>
      /(paypa1|paypa|paypol|amaz0n|amazn|g00gle|gogle|microsoftt|netfllx|netflx|faceb00k|instigram)/i.test(l),
  },
  {
    id: "no_punct_greeting",
    weight: 4,
    reason: "Generic, low-quality phrasing typical of mass phishing.",
    test: (_t, l) => /^(hi|hello|hey)\s+(there|sir|madam|friend)/i.test(l.trim()),
  },
  {
    id: "too_short",
    weight: 3,
    reason: "Very short message with a link — a common SMS phishing shape.",
    test: (t, l) => t.trim().length < 60 && /https?:\/\/|www\.|[a-z0-9-]+\.[a-z]{2,}/i.test(l),
  },
];

interface AnalysisResult {
  verdict: "safe" | "suspicious";
  risk_score: number;
  reasons: string[];
  matched_signals: string[];
}

function analyze(text: string): AnalysisResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  let score = 0;
  const reasons: string[] = [];
  const matched: string[] = [];

  for (const sig of signals) {
    try {
      if (sig.test(trimmed, lower)) {
        score += sig.weight;
        matched.push(sig.id);
        if (!reasons.includes(sig.reason)) reasons.push(sig.reason);
      }
    } catch {
      // a single faulty signal shouldn't break the whole analysis
    }
  }

  // Gentle length-based credibility bump: long, well-formed messages are
  // slightly less likely to be blast phishing, but never enough to override
  // strong signals.
  if (trimmed.length > 400 && matched.length <= 1) score = Math.max(0, score - 5);

  const clamped = Math.max(0, Math.min(100, score));
  const verdict: "safe" | "suspicious" = clamped >= 50 ? "suspicious" : "safe";

  // If nothing triggered at all, give the user a neutral, reassuring reason.
  if (reasons.length === 0) {
    reasons.push("No strong phishing signals were detected in this message.");
  }

  return { verdict, risk_score: clamped, reasons, matched_signals: matched };
}

// --- Handler ------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed. Use POST." }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== "string") {
      return new Response(
        JSON.stringify({ error: "Request body must include a 'message' string." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const message = body.message as string;
    if (message.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Message cannot be empty." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const messageType: string =
      typeof body.message_type === "string" &&
      ["text", "sms", "email"].includes(body.message_type)
        ? body.message_type
        : "text";

    const result = analyze(message);

    return new Response(
      JSON.stringify({
        verdict: result.verdict,
        risk_score: result.risk_score,
        reasons: result.reasons,
        matched_signals: result.matched_signals,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
