import express from "express";
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";

const app = express();

app.use(json());

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

// OVO JE I DALJE async ALI SADA KORISTIM I next
app.all("*", async (req, res, next) => {
  // DAKLE OVDE MI NECEMO THROW-OVATI ERROR
  // throw new NotFoundError();
  // UMESTO TOGA CEMO DA POSALJEMO ERROR SA next
  next(new NotFoundError());
});

// GORNJE ERROR CE DAKLE SADA BITI PASSED INTO ERROR HANDLINF MIDDLEWARE
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
