import { Router } from "express";

const router = Router();

router.post("/api/tickets", async (req, res) => {
  return res.status(201).send({});
});

export { router as createTicketRouter };
