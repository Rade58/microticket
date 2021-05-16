# FILTERING RESERVED TICKETS FROM THE TABLE ON MAIN PAGE

ZELIM DA OVI TICKET-OVI BUDU MARKED I DA NEMAJU LINK KOJI VODI DO NJIHOVOG PAGE-A

**USTVARI BOLJE JE MODIFIKOVATI SAMI HANDLER INSIDE `tickets` MICROSERVICE, DA SE SAMO QUERY-UJE ZA TICKET-OVIMA, KOJI NISU RESERVED**

- `code tickets/src/routes/index.ts`

```ts
import { Router } from "express";
// TREBACE MI OVO
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Ticket } from "../models/ticket.model";

const router = Router();

router.get("/api/tickets", async (req, res) => {
  // SADA PRAVIM OVAKAV QUERY
  const ticketsOrderUndefined = await Ticket.find({
    orderId: undefined,
  });
  // DAKL UZIMAM SAMO TICKETS KOJI IMAJU null AO ORDER ID
  // ALI JA MISLI MDA SAM RANIJE POGRESIO, I DEFINISAO SAM DA KADA
  // ORDER EXPIRE-UJE DA SE NA TICKETU PODESI DA orderId
  // BUDE null ;ZATO MISLIM DA MI JE OVAKO SIGURNIJE DA URADIM

  const ticketsOrderNull = await Ticket.find({
    orderId: null,
  });

  const tickets = [...ticketsOrderUndefined, ...ticketsOrderNull];

  res.status(200).send(tickets);
});

export { router as getAllTicketsRouter };

```

**SADA MOZES DA ODES NA `https://microticket.com/tickets/new` I NAPRAVI 4 TICKETA**

PA ZATIM NPRAVI ORDERE ZA DVA I KUPI IH

PA ONDA POKUSAJ DA SE VRATIS NA ``https://microticket.com` ;DA VIDIS KOLIKO IMAS LISTED TICKET-A
