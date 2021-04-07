import { CustomError } from "./custom-error"; // ovo je abstrct klasa

export class NotAuthorizedError extends CustomError {
  statusCode = 401;

  message = "Not Authorized";

  constructor() {
    super("Not Authorized");

    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }

  serializeErrors() {
    return {
      errors: [{ message: this.message }],
    };
  }
}
