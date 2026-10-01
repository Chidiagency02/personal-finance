import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultAllocations } from "../data/defaultAllocations.ts";
import { calculateTree, normalizeTopLevel, rebalanceTopLevel, restoreTopLevel, sumPercentages } from "./calculations.ts";

test("editing a top-level share keeps the total at exactly 100%", () => {
  const updated = rebalanceTopLevel(defaultAllocations, "tithe", 17.35);
  assert.equal(updated[0].percentage, 17.35);
  assert.equal(sumPercentages(updated), 100);
  assert.equal(updated[1].children[0].percentage, 50);
});

test("adding and removing a section redistributes its share", () => {
  const custom = { id: "custom-123e4567-e89b-42d3-a456-426614174000", name: "Emergency fund", kind: "direct", percentage: 0 };
  const added = rebalanceTopLevel([...defaultAllocations, custom], custom.id, 12.5);
  assert.equal(added.at(-1).percentage, 12.5);
  assert.equal(sumPercentages(added), 100);
  const removed = normalizeTopLevel(added.filter((node) => node.id !== "kingdom"));
  assert.equal(sumPercentages(removed), 100);
  assert.equal(normalizeTopLevel([custom])[0].percentage, 100);
});

test("restoration retains custom cards, removed defaults, and nested math", () => {
  const customId = "custom-123e4567-e89b-42d3-a456-426614174000";
  const restored = restoreTopLevel(defaultAllocations, [
    { id: "kingdom", name: "Kingdom Investment" },
    { id: customId, name: "Emergency fund" },
  ], { kingdom: 60, poor: 40, [customId]: 40 });
  assert.deepEqual(restored.map((node) => node.id), ["kingdom", customId]);
  assert.equal(sumPercentages(restored), 100);
  assert.equal(calculateTree(restored, 1000)[0].children[0].effectivePercentage, 24);
});
