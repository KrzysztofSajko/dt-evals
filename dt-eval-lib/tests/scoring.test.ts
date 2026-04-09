import { describe, expect, it } from "vitest";
import { EvalInputError } from "../src/errors";
import { BINARY_SCALE, CONTINUOUS_SCALE, computeScore, LIKERT_SCALE } from "../src/scoring/index";

describe("computeScore", () => {
  it("binary scale: value 1 → pass", () => {
    const score = computeScore(1, BINARY_SCALE);
    expect(score).toEqual({ value: 1, label: "pass" });
  });

  it("binary scale: value 0 → fail", () => {
    const score = computeScore(0, BINARY_SCALE);
    expect(score).toEqual({ value: 0, label: "fail" });
  });

  it("continuous scale: value 0.7 → pass (default threshold 0.5)", () => {
    const score = computeScore(0.7, CONTINUOUS_SCALE);
    expect(score).toEqual({ value: 0.7, label: "pass" });
  });

  it("continuous scale: value 0.3 → fail", () => {
    const score = computeScore(0.3, CONTINUOUS_SCALE);
    expect(score).toEqual({ value: 0.3, label: "fail" });
  });

  it("continuous scale: value 0.5 (exact threshold) → pass", () => {
    const score = computeScore(0.5, CONTINUOUS_SCALE);
    expect(score).toEqual({ value: 0.5, label: "pass" });
  });

  it("likert scale: value 4 → pass", () => {
    const score = computeScore(4, LIKERT_SCALE);
    expect(score).toEqual({ value: 4, label: "pass" });
  });

  it("likert scale: value 2 → fail", () => {
    const score = computeScore(2, LIKERT_SCALE);
    expect(score).toEqual({ value: 2, label: "fail" });
  });

  it("likert scale: value 3 (exact threshold) → pass", () => {
    const score = computeScore(3, LIKERT_SCALE);
    expect(score).toEqual({ value: 3, label: "pass" });
  });

  it("throws on value below range minimum", () => {
    expect(() => computeScore(-1, BINARY_SCALE)).toThrow();
  });

  it("throws on value above range maximum", () => {
    expect(() => computeScore(2, BINARY_SCALE)).toThrow();
  });

  it("thresholdOverride: continuous with custom threshold 0.8 — value 0.7 → fail", () => {
    const score = computeScore(0.7, CONTINUOUS_SCALE, 0.8);
    expect(score).toEqual({ value: 0.7, label: "fail" });
  });

  it("thresholdOverride: continuous with custom threshold 0.3 — value 0.4 → pass", () => {
    const score = computeScore(0.4, CONTINUOUS_SCALE, 0.3);
    expect(score).toEqual({ value: 0.4, label: "pass" });
  });

  it("thresholdOverride: likert with custom threshold 4 — value 3 → fail", () => {
    const score = computeScore(3, LIKERT_SCALE, 4);
    expect(score).toEqual({ value: 3, label: "fail" });
  });

  it("thresholdOverride: takes precedence over scale.threshold", () => {
    // CONTINUOUS_SCALE threshold is 0.5, override to 0.9
    const score = computeScore(0.6, CONTINUOUS_SCALE, 0.9);
    expect(score.label).toBe("fail");
  });
});

describe("built-in scale templates", () => {
  it("BINARY_SCALE has correct type, range, and threshold", () => {
    expect(BINARY_SCALE).toEqual({
      type: "binary",
      range: [0, 1],
      threshold: 1,
    });
  });

  it("CONTINUOUS_SCALE has correct type, range, and threshold", () => {
    expect(CONTINUOUS_SCALE).toEqual({
      type: "continuous",
      range: [0, 1],
      threshold: 0.5,
    });
  });

  it("LIKERT_SCALE has correct type, range, threshold, and labels", () => {
    expect(LIKERT_SCALE).toEqual({
      type: "likert",
      range: [1, 5],
      threshold: 3,
      labels: {
        1: "Very Poor",
        2: "Poor",
        3: "Average",
        4: "Good",
        5: "Excellent",
      },
    });
  });
});

describe("thresholdOverride validation", () => {
  it("throws EvalInputError when thresholdOverride is above range max", () => {
    expect(() => computeScore(0.5, CONTINUOUS_SCALE, 2)).toThrow(EvalInputError);
  });

  it("throws EvalInputError when thresholdOverride is below range min", () => {
    expect(() => computeScore(0.5, CONTINUOUS_SCALE, -1)).toThrow(EvalInputError);
  });

  it("throws EvalInputError when thresholdOverride is NaN", () => {
    expect(() => computeScore(0.5, CONTINUOUS_SCALE, NaN)).toThrow(EvalInputError);
  });

  it("accepts thresholdOverride at range boundaries", () => {
    expect(computeScore(0.5, CONTINUOUS_SCALE, 0).label).toBe("pass");
    expect(computeScore(0.5, CONTINUOUS_SCALE, 1).label).toBe("fail");
  });

  it("throws for likert thresholdOverride out of range", () => {
    expect(() => computeScore(3, LIKERT_SCALE, 0)).toThrow(EvalInputError);
    expect(() => computeScore(3, LIKERT_SCALE, 6)).toThrow(EvalInputError);
  });
});
