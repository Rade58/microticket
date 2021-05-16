import { Router } from "express";
// TREBACE MI OVO
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Ticket } from "../models/ticket.model";

const router = Router();

router.get("/api/tickets", async (req, res) => {
  // SADA PRAVIM OVAKAV QUERY
  const tickets = await Ticket.find({
    /* orderId: {
      $not: {
        $type: "string",
      },
    }, */
  });

  res.status(200).send(tickets);
});

export { router as getAllTicketsRouter };
