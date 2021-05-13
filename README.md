# DEFINING AND THEN PUBLISHING `"payment:created"` EVENT

OPET KRECEMO OD NASEG LIBRARY-JA `@ramicktic/common` ,GDE DEFINISEMO INTERFACE ZA EVENT

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
  expiration_complete = "expiration:complete",
  // DODAO OVO IME KANALA
  payment_created = "payment:created",
}
```

- `touch common/src/events/event-interfaces/payment-created-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "../channel-names";

export interface PaymentCreatedEventI {
  channelName: CNE.payment_created;
  data: {
    id: string;
    orderId: string;
    stripeChargeId: string;
  };
}

```

TI SI GORE UVRSTIO stripeCharge ID, IAKO GA NE TREBA TRENUTNO NI JEDAN DEO TVOJE APLIKACIJE, NI JEDAN MICROSERVICE (PREDPOSTAVLJAM DA JE OVO FUTURE PROOFING; DAKLE NE KAZEM DA HOCEMO IMATI U NASEM PROJEKTU; ALI MOZE SE DESITI DA SE NEKAD NA PRIMER U BUDUCNOSTI DODA NOVI MICROSERVICE, KOJI CE VERIFIKOVATI PAYMENTS ILI HANDLE-UJE RETURNS ILI WHO KNOWS WHAT)

IZVOZIM INTERFACE IZ MODULA

- `code common/src/index.ts`

```ts
// ...
// ...
// ...
// ...

// EVO DODAO SAM OVO
export * from "./events/event-interfaces/payment-created-event";
```

DA SAD REPUBLISH-UJEMO MODULE

- `cd common`

- `npm run pub`
