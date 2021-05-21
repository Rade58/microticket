import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@ramicktick/common";

// UVOZIM HANDLER-A
import { createChargeRouter } from "./routes/new";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,
    // EVO OVO CEMO UMESTO OVOGA
    // secure: process.env.NODE_ENV !== "test",
    // PROSTO PODESITI DA BUDE `false`
    secure: false
  })
);

app.use(currentUser);

// POVEZUJEM GA OVDE
app.use(createChargeRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
