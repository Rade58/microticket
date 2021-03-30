export class DatabseConnectionError extends Error {
  public reason = "Error connecting to the database";
  public statusCode = 500;

  constructor() {
    super();

    Object.setPrototypeOf(this, DatabseConnectionError.prototype);
  }

  public serializeError() {
    return {
      errors: [{ message: this.reason }],
    };
  }
}
