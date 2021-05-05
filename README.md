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

## UPDATE-UJEMO NAS MODULL U NASIM MICROSERVICE-OVIMA

- `cd tickets` `yarn add @ramicktick/common --latest`

- `cd orders` `yarn add @ramicktick/common --latest`

## U SLEDECEM BRANCH-U CEMO UPDATE-OVATI CODE NASEG SAMOG PUBLISHINGA EVENT-OVA

JER NE SALJEMO version FIELD, A GORE SMO TYPE-OVALI version, TAKO DA MORAMO SLATI version PRI PUBLISHING-U
