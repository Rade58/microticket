import { Router } from "express";

const router = Router();

router.get("/api/orders/:orderId", async (req, res) => {
  //
  res.send({});
});

export { router as deatailsOfOneOrderRouter };
