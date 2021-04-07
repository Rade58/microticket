import { Router } from "express";
import { verify } from "jsonwebtoken";
// UVOZIM current-user MIDDLEWARE
import { currentUser } from "../middlewares/current-user";
//

const router = Router();

// DODACU OVDE, POMENUTI MIDDLEWARW
router.get("/api/users/current-user", currentUser, (req, res) => {
  if (!req.session || !(req.session as { jwt: string }).jwt) {
    res.send({ currentUser: null });
  }

  const { jwt } = req.session as { jwt: string };

  try {
    const payload = verify(jwt, process.env.JWT_KEY!);

    res.status(200).send({ currentUser: payload });
  } catch (err) {
    console.log(err);

    res.send({ currentUser: null });
  }
});

export { router as currentUserRouter };
