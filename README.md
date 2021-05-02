# EVENT INTERFACES FOR `"order:created"` AND `"order:cancelled"`

PRVO CEMO DA DODAMO NOVE UNOSE U ENUM ZA POSIBLE CHANNEL NAMES

- `code common/src/events/channel-names.ts`

```ts
/**
 * @description Channel Names Enum   (ALSO KNOWN AS SUBJECTS)
 * @description BITNO JE DA VREDNOSTI IMAJU ":"
 */
export enum ChannelNamesEnum {
  ticket_created = "ticket:created",
  ticket_updated = "ticket:updated",
  // DODAJEM OVA IMENA KANALA
  order_created = "order:created",
  order_cancelled = "order:cancelled",
}
```


