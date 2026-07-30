# Contributing to AW Open Core

Thanks for taking a look at this. AW's open-core repo exists so the methodology behind rule-based judgment models can be inspected and improved by anyone — not just used as a black box. Contributions are welcome across a few different areas, described below.

---

## Ways to contribute

### 1. Improve signal extraction (`/routing/signals.js`)
The current signal extraction is intentionally simple — keyword/pattern matching against fixed lexicons. This is the area most likely to benefit from outside contribution:

- Expanding lexicons (more terms per signal, multilingual terms)
- Flagging false positives/negatives you find in real inputs
- Proposing additional signals not yet captured (open an issue first to discuss before submitting a PR — new signals affect scoring downstream)

### 2. Improve the open reference models (`/models/ledger`, `/models/flow`)
- Bug fixes to the scoring math or thresholds
- Better test coverage
- Documentation clarity — if a comment doesn't explain *why* a threshold is what it is, that's worth flagging
- Edge cases where the model's output reads as wrong or unclear given its own stated logic

### 3. Add test cases (`/examples`)
Worked examples that stress-test the models — especially ones that reveal ambiguous or poorly-handled inputs — are extremely valuable. A good test case includes:
- The raw input
- What you expected vs. what the model produced
- Why you think that's a mismatch (referencing the model's stated logic, not just intuition)

### 4. Documentation
Clarity fixes to the README, this file, or `ARCHITECTURE.md` — especially where the distinction between "what's open" and "what's commercial" isn't clear.

---

## What we will NOT merge

- Changes that add LLM calls into the scoring/judgment path of the open reference models. The point of this repo is deterministic, auditable logic — that's non-negotiable for what's included here.
- New judgment models beyond the two already open (Ledger, Flow). AW's broader model library is part of the commercial product; this repo's scope is intentionally limited. Feel free to fork and build your own models using the shared routing/signal code — that's exactly what the MIT license is for — but new models won't be merged upstream into this repo.
- Contributions bundled with unrelated changes. Keep PRs scoped to one thing.

---

## How contributions relate to the commercial product

This repo is MIT-licensed and stands on its own. Improvements you make here are yours under the same license — you're free to use them however the license allows. Separately, and at our discretion, ideas or fixes that come out of this repo may inform the commercial AW model library, but there's no obligation either way. Contributing here doesn't grant rights to, or impose obligations on, the commercial product.

---

## Submitting a change

1. Open an issue first for anything beyond a small fix (typo, obvious bug) — this avoids wasted effort on changes that don't fit scope.
2. Fork, branch, and submit a PR against `main`.
3. Include a test case or example demonstrating the change where applicable.
4. Keep commit messages and PR descriptions specific — "fix scoring edge case in Ledger when confidence is 0" beats "bug fix."

---

## Code style

- Plain, well-commented JavaScript (Node). No frameworks needed for the core logic.
- Every scoring constant or threshold should have a comment explaining what it represents, even if briefly.
- Favor clarity over cleverness — this code exists to be read, not just to run.

---

## Questions

Open an issue for anything not covered here.
