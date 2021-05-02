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

# SADA CEMO DA KREIRAMO FILE-OVE ZA NOVE EVENT INTERFACES

- `touch common/src/events/event-interfaces/order-cancelled-event.ts`

- `touch common/src/events/event-interfaces/order-created-event.ts`

# DEFINISEM INTERFACE `OrderCreatedEventI`

- `code common/src/events/event-interfaces/order-created-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "../channel-names";
import { OrderStatusEnum } from "../types/order-status-enum";

export interface OrderCreatedEventI {
  channelName: CNE.order_created;
  data: {
    id: string;
    expiresAt: string;
    status: OrderStatusEnum;
    userId: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}
```

# DEFINISEM INTERFACE `OrderCancelledEventI`

- `code common/src/events/event-interfaces/order-cancelled-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "../channel-names";

export interface OrderCancelledEventI {
  channelName: CNE.order_cancelled;
  data: {
    id: string;
    ticket: {
      id: string;
    };
  };
}
```

# DA EXPORT-UJEMO SADA EVENT INTERFACE-OVE, KOJE SMO KREIRALI

- `code common/src/index.ts`

```ts
export * from "./errors/bad-request-error";
export * from "./errors/custom-error";
export * from "./errors/database-connection-error";
export * from "./errors/not-authorized-error";
export * from "./errors/not-found-error";
export * from "./errors/request-validation-error";
export * from "./middlewares/current-user";
export * from "./middlewares/error-handler";
export * from "./middlewares/require-auth";
export * from "./middlewares/validate-request";

export * from "./events/abstr/abstr-listener";
export * from "./events/abstr/abstr-publisher";
export * from "./events/channel-names";
export * from "./events/event-interfaces/ticket-created-event";
export * from "./events/event-interfaces/ticket-updated-event";

export * from "./events/types/order-status-enum";

// DODAO OVO
export * from "./events/event-interfaces/order-cancelled-event";
export * from "./events/event-interfaces/order-created-event";
```

# DA REPUBLISH-UJEMO LIBRARY

- `cd common`

- `npm run pub`
