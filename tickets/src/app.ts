import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { createTicketRouter } from "./routes/new";

//
import { getOneTicketByIdRouter } from "./routes/show";

import { errorHandler, NotFoundError, currentUser } from "@ramicktick/common";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,

    secure: process.env.NODE_ENV !== "test",
  })
);

// STAVICEMO GA OVDE KAKO BI USER BIO PROVIDED (AKO JE AUTHORIZATION OK)
// ZA SLEDECU SERIJU POVEZANIH HANDLER
app.use(currentUser);
//

app.use(createTicketRouter);
//
app.use(getOneTicketByIdRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
