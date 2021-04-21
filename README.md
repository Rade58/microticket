# HANDLER ZA GETTING SINGLE TICKET NE TREBA DA BUDE PROTECTED

RANIJE SAM MISLIO DA TREBA PA SAM DODAO `requireAuth` MIDDLEWARE

JEDINO SU PROTECTED ONAJ HANDLER ZA CREATION TICKETA I ZA UPDATING TICKET-A

SADA CU UKLONITI, POMENUTI MIDDLEWARE

- `code tickets/src/routes/show.ts`

```ts
import { Router } from "express";

// OVO NE TREBAM
import { /*  requireAuth, */ NotFoundError } from "@ramicktick/common";

import { Ticket } from "../models/ticket.model";

const router = Router();

router.get(
  "/api/tickets/:id",
  // OVO NE TREBAM
  // requireAuth,
  async (req, res) => {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.status(200).send(ticket);
  }
);

export { router as getOneTicketByIdRouter };
```

