import { Router } from "express";
import { Ticket } from "../models/ticket.model";

const router = Router();

router.get("/api/tickets", async (req, res) => {
  const tickets = await Ticket.find({});

  res.status(200).send(tickets);
});

export { router as getAllTicketsRouter };
