import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

// import { errorHandler } from "./middlewares/error-handler";
// import { NotFoundError } from "./errors/not-found-error";
import { errorHandler, NotFoundError } from "@ramicktick/common";
//

// OVO EXPORT-UJES ALI NA KRAJU UNUTAR OBJECT-A
const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    // DAKLE OVA OPCIAJ CE BITI false, KADA JE U PITANJU
    // TESTING
    secure: process.env.NODE_ENV !== "test",
  })
);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

// OVAKO MORAM DA EXPORT-UJEM
export { app };
