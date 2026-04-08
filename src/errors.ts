export class DtEvalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DtEvalError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EvalConfigError extends DtEvalError {
  constructor(message: string) {
    super(message);
    this.name = "EvalConfigError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EvalMetricError extends DtEvalError {
  constructor(message: string) {
    super(message);
    this.name = "EvalMetricError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EvalInputError extends DtEvalError {
  constructor(message: string) {
    super(message);
    this.name = "EvalInputError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EvalTimeoutError extends DtEvalError {
  constructor(message: string) {
    super(message);
    this.name = "EvalTimeoutError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class EvalResponseError extends DtEvalError {
  constructor(message: string) {
    super(message);
    this.name = "EvalResponseError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
