# INCLUDING `version` FIELD IN EVENT INTERFACES, INSIDE `common` MODULE

OVO CU URADITI Z SVAKI OD EVENT INTERFACE-OVA

- `code common/src/events/event-interfaces/order-cancelled-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "../channel-names";

export interface OrderCancelledEventI {
  channelName: CNE.order_cancelled;
  data: {
    id: string;
    // EVO U SKLOPU data, ZADAO SAM TAJ     version
    version: number;
    //
    ticket: {
      id: string;
    };
  };
}
```

- `code common/src/events/event-interfaces/order-created-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "../channel-names";
import { OrderStatusEnum } from "../types/order-status-enum";

export interface OrderCreatedEventI {
  channelName: CNE.order_created;
  data: {
    id: string;
    //
    version: number;
    //
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

- `code common/src/events/event-interfaces/ticket-created-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "../channel-names";

export interface TicketCreatedEventI {
  channelName: CNE.ticket_created;
  data: {
    id: string;
    //
    version: number;
    //
    title: string;
    price: number;
    userId: string;
  };
}
```

- `code common/src/events/event-interfaces/ticket-updated-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "../channel-names";

export interface TicketUpdatedEventI {
  channelName: CNE.ticket_updated;
  data: {
    id: string;
    //
    version: number;
    //
    title: string;
    price: number;
    userId: string;
  };
}
```

## REPUBLISH-UJEM `common` MODULE

- `cd common`

- `npm run pub`
