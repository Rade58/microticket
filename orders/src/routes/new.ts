import { Router } from "express";

const router = Router();

router.post("/api/orders", async (req, res) => {
  //
  res.send({});
});

export { router as createNewOrderRouter };
