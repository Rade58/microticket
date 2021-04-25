# TYPING EVENT DATA WITH TYPESCRIPT; TYPING CHNNEL NAMES WITH TYPESCRIPT

IDEJA JE DA TYPE-UJES KLASU KOJA EXTENDUJE ABSTRACTNU KLASU Listener

ALI IDEJA JE DA TYPE-UJES CHANNEL NAME (ILI KAKO GA JOS NAZIVAJU subject)

**ALI JOS VAZNIJE TYPE-OVANJE SUBJETA TREB ODMA DA TYPE-UJE KAKVA DATA, KOJI TI JE DOSTUPAN U `onMessage` METODI KLASE, A TO JE DATA KOJ IJE DOSAO SA EVENTOM**

# KREIRCU SADA ENUM U KOJEM CU DRZATI SVE MOGUCE SUBJECTS (CHANNEL NAMES)

- `touch nats_test_project/src/events/channel-names.ts`

```ts
/**
 * @description Channel Names Enum   (SUBJECTS)
 * @description BITNO JE DA VREDNOSTI IMAJU ":"
 */
export enum ChannelNamesEnum {
  ticket_created = "ticket:created",
  // DODAO SAM I OVAJ SUBJECT, NARAVNO
  // JOS NIJE BITAN, ALI CE TI POSTATI BITAN KASNIJE
  // LADA BUDES NASTAVIO SA DEVELOPMENTOM TVOG MAIN PROJECT-A
  order_updated = "order:updated",
}

// NARAVNO KADA GOD BUDES ZELEO DA KORISTIS NOVI CHNNEL IDEJ JE 
// DA SE OVDE VRATIOS OVO UPDATE-UJES

```

# ENUM TYPE COUPLING WITH DATA INTERFACE

- `touch nats_test_project/src/events/ticet-created-event.ts`

```ts
import { ChannelNamesEnum as CNE } from "./channel-names";

export interface TicketCreatedEventI {
  subject: CNE.ticket_created;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
```
