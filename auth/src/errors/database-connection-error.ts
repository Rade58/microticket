export class DatabseConnectionError extends Error {
  public reason = "Error connecting to the datbase";

  constructor() {
    super();

    Object.setPrototypeOf(this, DatabseConnectionError.prototype);
  }
}
