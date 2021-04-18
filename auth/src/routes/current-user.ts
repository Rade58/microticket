import { Router } from "express";
// UMESTO OVOGA
// import { currentUser } from "../middlewares/current-user";
// UVOZIM OVO
import { currentUser } from "@ramicktick/common";
//

const router = Router();

router.get("/api/users/current-user", currentUser, (req, res) => {
  return res.send({
    currentUser: !req.currentUser ? null : req.currentUser,
  });
});

export { router as currentUserRouter };
