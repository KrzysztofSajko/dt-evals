import { EvalConfigError, EvalInputError } from "../errors";
import type { Score, ScoringScale } from "./types";

/**
 * Compute a score from a raw value using a scoring scale.
 * Optionally override the scale's default threshold.
 */
export function computeScore(
  value: number,
  scale: ScoringScale,
  thresholdOverride?: number,
): Score {
  if (!Number.isFinite(value)) {
    throw new EvalInputError(`Score value must be a finite number, got ${value}`);
  }

  const [min, max] = scale.range;
  if (value < min || value > max) {
    throw new EvalInputError(`Score value ${value} is out of range [${min}, ${max}]`);
  }

  if (scale.type === "likert" && !Number.isInteger(value)) {
    throw new EvalInputError(`Likert scale requires integer values, got ${value}`);
  }

  // Validate scale.threshold
  if (!Number.isFinite(scale.threshold) || scale.threshold < min || scale.threshold > max) {
    throw new EvalConfigError(
      `Scale threshold ${scale.threshold} is out of range [${min}, ${max}]`,
    );
  }
  if (scale.type === "likert" && !Number.isInteger(scale.threshold)) {
    throw new EvalConfigError(`Likert scale requires an integer threshold, got ${scale.threshold}`);
  }

  if (thresholdOverride !== undefined) {
    if (!Number.isFinite(thresholdOverride) || thresholdOverride < min || thresholdOverride > max) {
      throw new EvalInputError(
        `Threshold override ${thresholdOverride} is out of range [${min}, ${max}]`,
      );
    }
    if (scale.type === "likert" && !Number.isInteger(thresholdOverride)) {
      throw new EvalInputError(
        `Likert scale requires an integer threshold override, got ${thresholdOverride}`,
      );
    }
  }

  const threshold = thresholdOverride !== undefined ? thresholdOverride : scale.threshold;
  const label: Score["label"] = value >= threshold ? "pass" : "fail";

  return { value, label };
}
