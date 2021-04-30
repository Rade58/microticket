import { Router } from "express";

const router = Router();

router.get("/api/orders", async (req, res) => {
  //
  res.send({});
});

export { router as listAllOrdersRouter };
