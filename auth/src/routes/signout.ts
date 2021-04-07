import { Router } from "express";

const router = Router();

router.post("/api/users/signout", (req, res) => {
  req.session = null;

  // POSLACEMO SAMO EMPTY OBJECT U RESPONSE-U
  res.send({});
});

export { router as signOutRouter };
