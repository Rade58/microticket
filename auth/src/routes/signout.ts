import { Router } from "express";

const router = Router();

// MISLIM DA OVO MOZE BITI GET REQUEST, NE MORA POST
// JER NAM NE TREBA NIKAKAV DATA
router.get("/api/users/signout", (req, res) => {
  req.session = null;

  // POSLACEMO SAMO EMPTY OBJECT U RESPONSE-U
  res.send({});
});

export { router as signOutRouter };
