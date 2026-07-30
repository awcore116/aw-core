/**
 * AW Reference Model — "Flow"
 *
 * Judgment logic derived from wu-wei / non-forcing reasoning: the
 * question isn't "what's the best outcome" but "is this the right
 * moment, and does acting now require forcing against resistance."
 *
 * This model does NOT use an LLM. It scores a small set of inputs
 * (all 0-10 unless noted) and returns a deterministic read.
 */

const { extractSignals } = require("../../routing/signals");

/**
 * @typedef {object} FlowInput
 * @property {number} timingAlignment   // 0-10: how much external conditions already favor this move
 * @property {number} effortEfficiency  // 0-10: inverse of resistance required (high = low resistance)
 * @property {number} nonForcing        // 0-10: is the motive responsive rather than anxious/controlling
 * @property {number} reversibilityBuffer // 0-10: higher = safer to act even if timing isn't perfect
 */

const WEIGHTS = {
  timingAlignment: 0.4,
  effortEfficiency: 0.3,
  nonForcing: 0.2,
  reversibilityBuffer: 0.1,
};

const ACT_THRESHOLD = 7;
const WAIT_LOWER_BOUND = 4;

/**
 * Score a decision using explicit Flow inputs.
 * @param {FlowInput} input
 */
function scoreDecision(input) {
  const score =
    input.timingAlignment * WEIGHTS.timingAlignment +
    input.effortEfficiency * WEIGHTS.effortEfficiency +
    input.nonForcing * WEIGHTS.nonForcing +
    input.reversibilityBuffer * WEIGHTS.reversibilityBuffer;

  let read;
  if (score >= ACT_THRESHOLD) {
    read = "act";
  } else if (score >= WAIT_LOWER_BOUND) {
    read = "wait";
  } else {
    read = "reframe";
  }

  return { score, read };
}

/**
 * Convenience helper: derive rough Flow inputs from raw text signals
 * (using the shared signal extractor) when explicit numeric inputs
 * aren't available. This is a simple heuristic bridge, not a
 * replacement for a caller providing real scored inputs.
 *
 * @param {string} text
 * @returns {FlowInput}
 */
function inputsFromText(text) {
  const signals = extractSignals(text);

  // Heuristic mapping — intentionally simple and documented so it's
  // easy to audit or replace.
  const timingAlignment = signals.temporal_flexibility ? 6 : signals.temporal_urgency ? 3 : 5;
  const effortEfficiency = signals.temporal_urgency ? 3 : 6;
  const nonForcing = signals.temporal_urgency ? 3 : 6;
  const reversibilityBuffer = 5; // unknown from text alone; caller should override if known

  return { timingAlignment, effortEfficiency, nonForcing, reversibilityBuffer };
}

function formatOutput(read, score, context = {}) {
  const templates = {
    act: `Score ${score.toFixed(1)} — conditions favor acting now, with minimal resistance. ${
      context.actionHint ? `Minimal-resistance version: ${context.actionHint}` : ""
    }`,
    wait: `Score ${score.toFixed(1)} — conditions aren't fully aligned yet. This isn't a "no," it's a "not yet." ${
      context.waitSignal ? `Re-check when: ${context.waitSignal}` : "Name the specific external signal that would flip this to act."
    }`,
    reframe: `Score ${score.toFixed(1)} — this reads as forcing rather than flowing. Worth reframing the goal or delaying rather than pushing through resistance.`,
  };
  return templates[read];
}

/**
 * Full evaluate: accepts either explicit FlowInput or raw text.
 * @param {FlowInput|string} input
 * @param {object} [context] - optional { actionHint, waitSignal }
 */
function evaluate(input, context = {}) {
  const resolvedInput = typeof input === "string" ? inputsFromText(input) : input;
  const { score, read } = scoreDecision(resolvedInput);
  const output = formatOutput(read, score, context);
  return { input: resolvedInput, score, read, output };
}

module.exports = { evaluate, scoreDecision, inputsFromText };
