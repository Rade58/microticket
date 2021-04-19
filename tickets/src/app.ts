import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

// UVEZAO
import { createTicketRouter } from "./routes/new";
//

import { errorHandler, NotFoundError } from "@ramicktick/common";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,

    secure: process.env.NODE_ENV !== "test",
  })
);

// EVO OVDE CU POVEZATI ROUTERA
app.use(createTicketRouter);
//

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
