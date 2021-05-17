// UVOZIM ABSTRACT CLASS CustomError KOJU SAM RANIJE DAVNO NAPRAVIO
import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  statusCode = 400;
  public message: string;

  constructor(message: string) {
    super(message);

    this.message = message;

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return {
      errors: [
        {
          message: this.message,
        },
      ],
    };
  }
}
