import { describe, it } from "node:test";
import assert from "node:assert";
import { computeScore } from "./score.js";

describe("computeScore", () => {
  it("returns zeros when no votes", () => {
    const score = computeScore([]);
    assert.deepStrictEqual(score, { good: 0, bad: 0, percentage: 0 });
  });

  it("counts good votes", () => {
    const votes = [{ value: "good" }, { value: "good" }, { value: "good" }];
    const score = computeScore(votes);
    assert.deepStrictEqual(score, { good: 3, bad: 0, percentage: 100 });
  });

  it("counts bad votes", () => {
    const votes = [{ value: "bad" }, { value: "bad" }];
    const score = computeScore(votes);
    assert.deepStrictEqual(score, { good: 0, bad: 2, percentage: 0 });
  });

  it("computes mixed percentage", () => {
    const votes = [{ value: "good" }, { value: "good" }, { value: "bad" }];
    const score = computeScore(votes);
    assert.deepStrictEqual(score, { good: 2, bad: 1, percentage: 67 });
  });

  it("computes 50/50 split", () => {
    const votes = [{ value: "good" }, { value: "bad" }];
    const score = computeScore(votes);
    assert.deepStrictEqual(score, { good: 1, bad: 1, percentage: 50 });
  });
});
