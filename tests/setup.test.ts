import { describe, expect, it } from "vitest";
import {
  DtEvalError,
  EvalConfigError,
  EvalInputError,
  EvalMetricError,
  EvalResponseError,
  EvalTimeoutError,
} from "../src/errors";

const errorClasses = [
  { Class: DtEvalError, name: "DtEvalError", parent: Error },
  { Class: EvalConfigError, name: "EvalConfigError", parent: DtEvalError },
  { Class: EvalMetricError, name: "EvalMetricError", parent: DtEvalError },
  { Class: EvalInputError, name: "EvalInputError", parent: DtEvalError },
  { Class: EvalTimeoutError, name: "EvalTimeoutError", parent: DtEvalError },
  { Class: EvalResponseError, name: "EvalResponseError", parent: DtEvalError },
] as const;

describe("Error classes", () => {
  it.each(errorClasses)("$name extends $parent.name and sets correct name/message", ({
    Class,
    name,
    parent,
  }) => {
    const err = new Class("test message");
    expect(err).toBeInstanceOf(parent);
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe(name);
    expect(err.message).toBe("test message");
  });
});
