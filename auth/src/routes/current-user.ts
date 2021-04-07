import { Router } from "express";
// import { verify } from "jsonwebtoken";
// UVOZIM current-user MIDDLEWARE
import { currentUser } from "../middlewares/current-user";
//

const router = Router();

// DODACU OVDE, POMENUTI MIDDLEWARW
router.get("/api/users/current-user", currentUser, (req, res) => {
  // AKO JE KORISNIK AUTHENTICATED IMAS NA req.currentUser USER OBJEKAT
  // A AKO NEM OBJEKAT ONDA JE req.currentUser, USTVARI null

  // ZATO MI NISTA OVO VISE NE TREBA
  /*
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
  } */

  // A SALJEM OBJEKAT TO THE USER OVAKO
  // ALI VODIM RACUNA DA SALJEM null A NE undefined
  // PROSTO TAKO JE BOLJE
  res.send({
    currentUser: !req.currentUser ? null : req.currentUser,
  });
});

export { router as currentUserRouter };
