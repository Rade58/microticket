import { Router } from "express";

const router = Router();

router.delete("/api/orders/:orderId", async (req, res) => {
  //
  res.send({});
});

export { router as deleteSingleOrderRouter };
