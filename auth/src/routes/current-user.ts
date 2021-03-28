import { Router } from "express";

const router = Router();

router.get("/api/users/current-user", (req, res) => {
  res.send("Hello there Stavros!");
});

export { router as currentUserRouter };
