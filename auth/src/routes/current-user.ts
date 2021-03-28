import { Router } from "express";

const router = Router();

router.get("/api/users/current-user", (req, res) => {});

export { router as currentUserRouter };
