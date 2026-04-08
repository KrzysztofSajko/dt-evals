/** Supported scoring scale types */
export type ScoringScaleType = "binary" | "continuous" | "likert";

/** Definition of a scoring scale */
export interface ScoringScale {
  type: ScoringScaleType;
  /** Range of valid score values [min, max] */
  range: [number, number];
  /** Threshold at or above which the label is "pass" */
  threshold: number;
  /** Optional labels for discrete values (likert) */
  labels?: Record<number, string>;
}

/** A computed score result */
export interface Score {
  value: number;
  label: "pass" | "fail";
}
