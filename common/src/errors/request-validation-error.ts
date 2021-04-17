import { ValidationError } from "express-validator";
//
import { CustomError } from "./custom-error";
//

export class RequestValidationError extends CustomError {
  public errors: ValidationError[];
  public statusCode = 400;

  constructor(errors: ValidationError[]) {
    super("Invalid request params");
    this.errors = errors;
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  public serializeErrors() {
    const formattedErrors = this.errors.map(({ msg, param }) => {
      return { message: msg, field: param };
    });

    return { errors: formattedErrors };
  }
}
