import { CustomError } from "./custom-error";

export class DatabseConnectionError extends CustomError {
  public reason = "Error connecting to the database";
  public statusCode = 500;

  constructor() {
    super("Invalid request params");

    Object.setPrototypeOf(this, DatabseConnectionError.prototype);
  }

  public serializeErrors() {
    return {
      errors: [{ message: this.reason }],
    };
  }
}
