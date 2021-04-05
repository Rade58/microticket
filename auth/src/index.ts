import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import mongoose from "mongoose";
// UVOZIM POMENUTI PAKET
import cookieSession from "cookie-session";
//

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();

// ZATO STO SAM DOLE PODESIO DA JE COOKIE ONLY AVAILABLE AKO JE PODESEN SSL
// JA PRAVIM OVAJ SETTING
app.set("trust proxy", true);
// OVO GORE SAM PODESIO JER TRAFFIC PROXIED DO NASEG APP-A,
// KROZ INGRESS NGINX
// EXPRESS CE VIDETI THAT STUFF IS BEING PROXIED, I PO DEFAULT-U
// NECE TRUST-OVAATI HTTPS CONNECTION-U
// JA SAM DODAO GORNJI STEP, DA EXPRESS BUDE AWARE DA JE BEHIND
// A PROXY INGRESS NGINX-A
// I DA VERUJE TRAFFIC-U D JE ON SECURED IAKO DOLAZI SA TOG PROXY-JA
// OVO GORNJE OBJASNJENE MI JE TOLIKO NERAZUMLJIVO
//  MISLIM DA JE OVDE:
// https://stackoverflow.com/questions/23413401/what-does-trust-proxy-actually-do-in-express-js-and-do-i-need-to-use-it
// BOLJE OBJASNJENO

app.use(json());

// POVEZUJEM MIDDLEWARE NA OVOM MESTU
app.use(
  cookieSession({
    // DISABLE-UJEM ENCRYPTION KAKO SAM REKAO DA CU URADITI
    signed: false,
    // REQUIREMENT DA COOKIE WILL ONLY BE USED IF USER IS
    // VISITING APP, OVER A HTTPS CONNECTION (SMALL SECURITY EMPROVEMENT)
    secure: true,
  })
);
// POVEZAO SAM MIDDLEWARE NA GORNJEM MESTU
// KAKO BI DONJI ROUTER, ODNOSNO NJIHOVE ROUTE HANDLERI
// MOGLII DA KORISTE PARSED UP VALUE FROM THE COOKIE

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB");
  } catch (err) {
    console.log("Failed to connect to DB");
    console.log(err);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
  });
};

start();
