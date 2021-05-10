# DEFINISANJE `ExpirationCompleteEventI` INTEFACE-A, U `common` MODULE-U

DOAJEMO PRVO NOVI CHANNEL NAME INSIDE CHANNEL NAME ENUM

- `code common/src/events/channel-names.ts`

```ts
/**
 * @description Channel Names Enum   (ALSO KNOWN AS SUBJECTS)
 * @description BITNO JE DA VREDNOSTI IMAJU ":"
 */
export enum ChannelNamesEnum {
  ticket_created = "ticket:created",
  ticket_updated = "ticket:updated",
  order_created = "order:created",
  order_cancelled = "order:cancelled",
  // DODAO OOVO IME KANALA
  expiration_complete = "expiration:complete",
}

```

SADA PRAVIMO INTERFACE Z NOVI EVENT

- `touch common/src/events/event-interfaces/expiration-complete-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "../channel-names";

export interface ExpirationCompleteEventI {
  channelName: CNE.expiration_complete;
  data: {
    orderId: string;
  };
}
```

## MORAMO DA `ExpirationCompleteEventI` IZVEZEMO IZ `index.ts` FAJLA NASEG common MODULE-A

- `code common/src/index.ts`

```ts
// ...
// ...

// EVO DODAO SAM OVO
export * from "./events/event-interfaces/expiration-complete-event";

```

# MOZEMO SADA DA REPUBLISH-UJEMO NAS PACKAGE

- `cd common`

- `npm run pub`

# PA SADA MOZEMO DA INSTALIRAMO NOVIJU VERZIJU NASEG common MODULE-A, INSIDE `expiration` MICROSERVICE

- `cd expiration`

- `yarn add @ramicktick/common --latest`
