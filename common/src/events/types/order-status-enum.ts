export enum OrderStatusEnum {
  /**
   * @description when the order has been created, but ticket
   * trying to be ordered, is not reserved
   */
  created = "created",
  /**
   * @description ticket, that is being tried to be reserved, has already
   * been reserved, or user cancelled the order,
   * or payment info was wrong
   * or order expired before payment
   */
  cancelld = "cancelled",
  /**
   * @description ticket is successfully reserved
   */
  awaiting_payment = "awaiting:payment",

  /**
   * @description user has provided payment info successfully
   */
  complete = "complete",
}
