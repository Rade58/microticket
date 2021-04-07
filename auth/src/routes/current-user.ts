import { Router } from "express";
import { currentUser } from "../middlewares/current-user";
// UVOZIM requreAuth MIDDLEWARE
import { requireAuth } from "../middlewares/require-auth";

const router = Router();

// DODAJEM requreAuth MIDDLEWARE, ALI VODI RACUNA DA
// GA DODAS NALON currentUser MIDDLEWARE-A
// JER ONO JE TAJ MIDDLEWARE, KOJI STAVLJA currentUser-A
// NA REQUEST, A requireAuth PROVERAVA DA LI JE USER TU
router.get("/api/users/current-user", currentUser, requireAuth, (req, res) => {
  res.send({
    currentUser: !req.currentUser ? null : req.currentUser,
  });
});

export { router as currentUserRouter };
