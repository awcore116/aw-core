# AW Architecture (Open Core)

This document explains how the pieces in this repo fit together, and how they relate to the full AW system (routing + full 7-model library + hosted MCP API), most of which lives outside this repo.

---

## High-level flow

```
Raw input text (a decision/judgment question)
        │
        ▼
┌───────────────────────┐
│  Signal Extraction     │   /routing/signals.js
│  (keyword/pattern tag) │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  Model Selection        │   (full routing logic — see note below)
│  (which model(s) fire)  │
└───────────────────────┘
        │
        ▼
┌───────────────────────┐
│  Judgment Model(s)       │   /models/ledger, /models/flow (open here)
│  (scoring + output)      │   + 5 additional models (commercial only)
└───────────────────────┘
        │
        ▼
   Structured output (score, read, formatted text)
```

**Note on scope:** This repo includes the signal extraction module and two full judgment models (Ledger, Flow). The model *selection* logic — deciding which of the 7 total models to invoke for a given input, handling overrides and escalation — is part of AW's full routing specification and is not fully reproduced as running code here. What's open is enough to understand the methodology and run the two included models directly against your own inputs.

---

## Design principles

1. **No LLM in the judgment path.** Every score, threshold, and output template in this repo is a deterministic function of its inputs. Given the same input, you always get the same output. This is intentional — it's what makes the logic auditable.

2. **Signals are extracted once, shared across models.** `/routing/signals.js` is a single shared module — each model consumes the signals it needs rather than re-parsing text independently. This keeps tagging logic in one place.

3. **Models are self-contained.** Each model in `/models/` exports its own `evaluate()` function with its own scoring formula and output template. A model doesn't depend on another model's internals — you can use Ledger or Flow independently of each other, or independently of the (unincluded) routing layer, by calling them directly with structured input.

4. **Two input modes per model, where practical.** Flow, for example, accepts either raw text (auto-derived via a heuristic bridge to `signals.js`) or a fully explicit structured input (`FlowInput`) if you already know the values you want to score. Ledger requires structured input (per-stakeholder benefit/cost/confidence) since utilitarian scoring can't be meaningfully guessed from keyword matching alone — that's a deliberate constraint, not an oversight.

---

## Module reference

### `/routing/signals.js`
Exports `extractSignals(text)`, returning a plain object of booleans/counts (financial stakes, temporal urgency, stakeholder count, etc.) derived from keyword lexicons defined in the same file. No state, no side effects — pure function of input text.

### `/models/ledger/index.js`
Exports `evaluate(options)`. Takes an array of options, each with a list of stakeholder estimates (`{ name, benefit, cost, confidence }`), and returns:
- Per-option net scores (confidence-weighted sum of benefit-minus-cost across stakeholders)
- A recommendation string (best option, "too close to call," or "confidence too low to decide")
- Flags for any stakeholder absorbing a severe concentrated cost even under a net-positive option

### `/models/flow/index.js`
Exports `evaluate(input, context)`. Takes either a `FlowInput` object (`timingAlignment`, `effortEfficiency`, `nonForcing`, `reversibilityBuffer`, all 0–10) or raw text (auto-converted via `inputsFromText()`), and returns a weighted score plus a categorical read: `act`, `wait`, or `reframe`.

---

## How this connects to the full AW system

The complete AW product (not in this repo) adds:

- **The remaining 5 judgment models** (Anchor, Bond, Clear, Web, Compass), each following the same architectural pattern — own classifier/scoring/output template — but tuned and maintained as part of the commercial offering
- **Full model-selection routing**: scoring all 7 models' relevance to a given input, applying mandatory override rules (e.g., irreversible decisions always include Anchor), and conflict-escalation logic when selected models' reads diverge
- **MCP server interface**: exposing `evaluate`-style calls as tools other AI agents can invoke directly, with API key + credit-based access
- **Tuned production weights**: the weights and thresholds in this repo's open models are reasonable defaults, not the calibrated values used in the hosted system

If you're building on this repo, treat it as a correct but minimal reference — the full system layers routing, more models, and hosting on top of the same architectural pattern shown here.

---

## Extending this repo

Want to add your own model on top of the open routing/signals code? A model in this pattern needs:

1. A classifier — what axes/signals does this model care about (can reuse `/routing/signals.js` or extend it)
2. A weighted scoring formula — explicit constants, each commented with what it represents
3. Threshold logic — what score ranges map to what categorical read
4. An output template — how the read gets turned into readable text

See `/models/flow/index.js` for the shortest complete example of this pattern.
