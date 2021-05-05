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
