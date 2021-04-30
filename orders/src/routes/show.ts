import { Router } from "express";

const router = Router();

router.get("/api/orders/:id", async (req, res) => {
  //
  res.send({});
});

export { router as deatailsOfOneOrderRouter };
