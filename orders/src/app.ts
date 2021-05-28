import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
// -------- EVO OVO DODAJEM --------
import { listAllOrdersRouter } from "./routes/";
import { deatailsOfOneOrderRouter } from "./routes/show";
import { createNewOrderRouter } from "./routes/new";
import { deleteSingleOrderRouter } from "./routes/delete";
// ---------------------------------
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

// ---- POVEZUJEM, POMENUTE ROUTERE ----
app.use(listAllOrdersRouter);
app.use(deatailsOfOneOrderRouter);
app.use(createNewOrderRouter);
app.use(deleteSingleOrderRouter);
// -------------------------------------

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
