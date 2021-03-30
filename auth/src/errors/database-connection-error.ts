export class DatabseConnectionError extends Error {
  public error = "Error connecting to the datbase";

  constructor() {
    super();

    Object.setPrototypeOf(this, DatabseConnectionError.prototype);
  }
}
