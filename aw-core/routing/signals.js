/**
 * AW Open Core — Signal Extraction
 *
 * Pure pattern/keyword-based tagging of raw input text. No LLM calls.
 * This is intentionally simple (v1) — see README for the v2 note on
 * swapping this for an embedding-similarity classifier if keyword
 * matching proves too brittle in practice.
 */

const LEXICONS = {
  financial: [
    "invest", "money", "cost", "price", "budget", "save", "spend",
    "revenue", "salary", "profit", "loss", "buy", "sell", "$", "dollar",
  ],
  temporalUrgency: [
    "right now", "immediately", "before", "deadline", "tomorrow", "urgent",
    "asap", "today",
  ],
  temporalFlexibility: [
    "eventually", "no rush", "whenever", "at some point", "not yet", "later",
  ],
  timingLanguage: [
    "wait", "timing", "ready", "hold off", "right moment", "too soon",
  ],
  quantifiableHints: [
    "%", "percent", "roi", "return", "increase", "decrease", "output",
  ],
};

/** Case-insensitive substring match against a lexicon list. */
function matchesAny(text, lexicon) {
  const lower = text.toLowerCase();
  return lexicon.some((term) => lower.includes(term));
}

/** Count occurrences of numeric or currency-like patterns. */
function hasNumbers(text) {
  return /\d/.test(text) || /\$\s?\d/.test(text);
}

/**
 * Extract the signal set used by the Ledger and Flow reference models.
 * (Full AW production routing extracts a larger signal set for all
 * 7 models — this is the subset needed for the two open models here.)
 *
 * @param {string} text - raw decision/input text
 * @returns {object} signals
 */
function extractSignals(text) {
  return {
    financial_stakes: matchesAny(text, LEXICONS.financial),
    quantifiable_outcome: hasNumbers(text) || matchesAny(text, LEXICONS.quantifiableHints),
    temporal_urgency: matchesAny(text, LEXICONS.temporalUrgency),
    temporal_flexibility: matchesAny(text, LEXICONS.temporalFlexibility),
    timing_language: matchesAny(text, LEXICONS.timingLanguage),
    // crude stakeholder count: distinct person-referring tokens
    stakeholder_count: countStakeholders(text),
  };
}

function countStakeholders(text) {
  const tokens = ["i", "you", "we", "they", "team", "client", "partner", "family", "employee", "customer"];
  const lower = text.toLowerCase();
  const found = new Set();
  tokens.forEach((t) => {
    const re = new RegExp(`\\b${t}\\b`, "g");
    if (re.test(lower)) found.add(t);
  });
  return found.size;
}

module.exports = { extractSignals, LEXICONS };
