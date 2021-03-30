export class DatabseConnectionError extends Error {
  public reason = "Error connecting to the database";

  constructor() {
    super();

    Object.setPrototypeOf(this, DatabseConnectionError.prototype);
  }
}
