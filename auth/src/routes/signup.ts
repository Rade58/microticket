import { Router } from "express";
// UVOZIM body IZ express-validator
// POSTOJI NEKOLIKO NACINA DA SE KORISTI POMENUTI PAKET
// ALI JA CU KORISTITI OVU body STVAR
import { body } from "express-validator";

// body JE FUNKCIJA KOJA CE CHECK-OVATI body ICOMMING REQUEST-A

// SA OVIM PAKETOM SE MOGU CHECK-OVATI I QUERY PARAMETERS,
// TAKODJE MOZE HANDLE-OVATI VALIDATION I QUERY STRINGOVA (MEDJUTIM JA OVE STVARI SADA NE KORISTIM)

// POMENUTU FUNKCIJU CU APPLY-OVATI KAO MIDDLEWARE
// ALI TO NECU RADITI SA .use, VEC PRI DEFINISANJU HANDLER-A
//  U JEDNOM ARRAY-U KOJI CE ICI ISPRED HANDLERA

const router = Router();

// EVO VIDIS, KAKAV SAM ARRAY PRIDODAO
router.post(
  "/api/users/signup",
  [
    // VIDIS KAKO SE OVO MOZE CHAIN-OVATI
    // PRVO SE PROVERAVA DA LI JE email FIELD NA body-JU
    // PA ONDA SE PROVERAVA DA LI JE REC O EMAIL-U, A ONDA
    // SAM PODESIO I ERROR MASSEGE, KOJ ICE BITI SENT TO THE USER
    // AKO UNESENO NIJE U EMAIL FORMATU
    body("email").isEmail().withMessage("Email must be valid!"),
  ],
  (req, res) => {
    const { email, password } = req.body;
  }
);

export { router as signUpRouter };
