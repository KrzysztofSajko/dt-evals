import type { ScoringScale } from "./types";

export const BINARY_SCALE: ScoringScale = {
  type: "binary",
  range: [0, 1],
  threshold: 1,
};

export const CONTINUOUS_SCALE: ScoringScale = {
  type: "continuous",
  range: [0, 1],
  threshold: 0.5,
};

export const LIKERT_SCALE: ScoringScale = {
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
};
