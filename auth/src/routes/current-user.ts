import { Router } from "express";
import { currentUser } from "../middlewares/current-user";
// import { requireAuth } from "../middlewares/require-auth";

const router = Router();

// UKLANJAM requireAuth
router.get(
  "/api/users/current-user",
  currentUser,
  /*requireAuth,*/ (req, res) => {
    res.send({
      currentUser: !req.currentUser ? null : req.currentUser,
    });
  }
);

export { router as currentUserRouter };
