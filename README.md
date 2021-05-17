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
  const tickets = await Ticket.find({
    // DODAO OVO
    orderId: null,
  });

  res.status(200).send(tickets);
  //
});

export { router as getAllTicketsRouter };
```

**SADA MOZES DA ODES NA `https://microticket.com/tickets/new` I NAPRAVI 4 TICKETA**

PA ZATIM NPRAVI ORDERE ZA DVA (**ALI NEMOJ DA IH KUPUJES, JER KAD IH KUPIS, SA TICKETA JE SKLONJEN orderId I OPET CE BITI LISTED**)

PA ONDA POKUSAJ DA SE VRATIS NA `https://microticket.com` ;DA VIDIS KOLIKO IMAS LISTED TICKET-A
