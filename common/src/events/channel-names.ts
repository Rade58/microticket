/**
 * @description Channel Names Enum   (ALSO KNOWN AS SUBJECTS)
 * @description BITNO JE DA VREDNOSTI IMAJU ":"
 */
export enum ChannelNamesEnum {
  ticket_created = "ticket:created",
  ticket_updated = "ticket:updated",
  order_created = "order:created",
  order_cancelled = "order:cancelled",
  expiration_complete = "expiration:complete",
  // DODAO OVO IME KANALA
  payment_created = "payment:created",
}
