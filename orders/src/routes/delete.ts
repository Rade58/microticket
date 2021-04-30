import { Router } from "express";

const router = Router();

router.delete("/api/orders/:id", async (req, res) => {
  //
  res.send({});
});

export { router as deleteSingleOrderRouter };
