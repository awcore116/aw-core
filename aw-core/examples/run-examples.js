const ledger = require("../models/ledger");
const flow = require("../models/flow");

console.log("=== Ledger example ===");
console.log(
  "Decision: confront business partner about missed deadlines — now vs. after client call vs. never\n"
);

const ledgerResult = ledger.evaluate([
  {
    label: "Confront now, before call",
    stakeholders: [
      { name: "You", benefit: 3, cost: 2, confidence: 0.6 },
      { name: "Partner", benefit: 0, cost: 4, confidence: 0.6 },
      { name: "Client", benefit: 0, cost: 3, confidence: 0.6 },
      { name: "Team", benefit: 0, cost: 1, confidence: 0.6 },
    ],
  },
  {
    label: "Wait until after the call",
    stakeholders: [
      { name: "You", benefit: 1, cost: 0, confidence: 0.8 },
      { name: "Partner", benefit: 2, cost: 0, confidence: 0.8 },
      { name: "Client", benefit: 5, cost: 0, confidence: 0.8 },
      { name: "Team", benefit: 2, cost: 0, confidence: 0.8 },
    ],
  },
  {
    label: "Say nothing at all",
    stakeholders: [
      { name: "You", benefit: 0, cost: 5, confidence: 0.7 },
      { name: "Partner", benefit: 1, cost: 0, confidence: 0.7 },
      { name: "Client", benefit: 2, cost: 0, confidence: 0.7 },
      { name: "Team", benefit: 0, cost: 3, confidence: 0.7 },
    ],
  },
]);

console.log(ledgerResult.output);

console.log("\n\n=== Flow example ===");
console.log("Decision text: 'Should I confront my business partner right now, before our client call tomorrow?'\n");

const flowResult = flow.evaluate(
  "Should I confront my business partner right now, before our client call tomorrow?",
  { waitSignal: "once the client call is done and there's no external pressure warping the conversation" }
);

console.log(`Derived inputs: ${JSON.stringify(flowResult.input)}`);
console.log(`Read: ${flowResult.read} (score ${flowResult.score.toFixed(2)})`);
console.log(flowResult.output);
