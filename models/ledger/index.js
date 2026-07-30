/**
 * AW Reference Model — "Ledger"
 *
 * Judgment logic derived from utilitarian/consequentialist reasoning:
 * optimize for the greatest net benefit across all named stakeholders,
 * explicitly calculated rather than felt.
 *
 * This model does NOT use an LLM. Callers supply structured stakeholder
 * estimates (see `evaluate()` input shape below); this module scores
 * and formats the result deterministically.
 */

/**
 * @typedef {object} StakeholderEstimate
 * @property {string} name
 * @property {number} benefit   // -10..10
 * @property {number} cost      // -10..10 (pass as positive; subtracted internally)
 * @property {number} confidence // 0..1
 */

/**
 * @typedef {object} OptionInput
 * @property {string} label
 * @property {StakeholderEstimate[]} stakeholders
 */

const SEVERE_COST_THRESHOLD = -8; // per-stakeholder net below this triggers a flag
const CLOSE_MARGIN_PCT = 0.15;    // options within 15% of each other are "close"

/**
 * Compute the confidence-weighted net score for a single option.
 * net = sum over stakeholders of (benefit - cost) * confidence
 */
function scoreOption(option) {
  let net = 0;
  const flags = [];

  for (const s of option.stakeholders) {
    const raw = s.benefit - s.cost;
    const weighted = raw * s.confidence;
    net += weighted;

    if (raw <= SEVERE_COST_THRESHOLD) {
      flags.push(
        `${s.name} absorbs a severe concentrated cost (raw ${raw}) under "${option.label}"`
      );
    }
  }

  return { label: option.label, net, flags };
}

/**
 * Evaluate a decision expressed as competing options with per-stakeholder
 * benefit/cost/confidence estimates, and return a Ledger-style judgment.
 *
 * @param {OptionInput[]} options
 * @returns {{scored: object[], recommendation: string, output: string}}
 */
function evaluate(options) {
  if (!options || options.length < 2) {
    throw new Error("Ledger requires at least 2 options to compare.");
  }

  const scored = options.map(scoreOption).sort((a, b) => b.net - a.net);
  const [best, second] = scored;

  const isClose =
    second !== undefined &&
    Math.abs(best.net - second.net) < Math.abs(best.net) * CLOSE_MARGIN_PCT;

  const allFlags = scored.flatMap((s) => s.flags);
  const lowConfidenceOverall = options.every((o) =>
    o.stakeholders.every((s) => s.confidence < 0.5)
  );

  let recommendation;
  if (lowConfidenceOverall) {
    recommendation =
      "Numbers are too speculative to trust — gather more information before deciding on aggregate grounds.";
  } else if (isClose) {
    recommendation = `"${best.label}" and "${second.label}" are close on net outcome — the tie-breaker should be which estimate you trust more (confidence), not which feels more comfortable.`;
  } else {
    recommendation = `"${best.label}" produces the best net outcome and is favored on aggregate.`;
  }

  const output = formatOutput(scored, recommendation, allFlags);

  return { scored, recommendation, output };
}

function formatOutput(scored, recommendation, flags) {
  const lines = [];
  lines.push("Ledger — aggregate outcome comparison:");
  scored.forEach((s) => {
    lines.push(`  - ${s.label}: net = ${s.net.toFixed(2)}`);
  });
  lines.push("");
  lines.push(recommendation);
  if (flags.length > 0) {
    lines.push("");
    lines.push("Flagged (disproportionate impact even where aggregate favors the option):");
    flags.forEach((f) => lines.push(`  - ${f}`));
  }
  return lines.join("\n");
}

module.exports = { evaluate, scoreOption };
