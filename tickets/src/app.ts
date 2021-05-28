import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { createTicketRouter } from "./routes/new";

import { getOneTicketByIdRouter } from "./routes/show";
import { getAllTicketsRouter } from "./routes/";
// UZEO OVO
import { updateOneTicketRouter } from "./routes/update";
//
//
import { errorHandler, NotFoundError, currentUser } from "@ramicktick/common";

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

app.use(createTicketRouter);
app.use(getOneTicketByIdRouter);
app.use(getAllTicketsRouter);
// DODAO OVO
app.use(updateOneTicketRouter);
//

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
