import { ValidationError } from "express-validator";

export class RequestValidationError extends Error {
  public errors: ValidationError[];
  // STATUS CODE
  public statusCode = 400;

  constructor(errors: ValidationError[]) {
    super();
    this.errors = errors;
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  // EVO JE METODA
  public serializeError() {
    const formattedErrors = this.errors.map(({ msg, param }) => {
      return { message: msg, field: param };
    });

    return { errors: formattedErrors };
  }
}
