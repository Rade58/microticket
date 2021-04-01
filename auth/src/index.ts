import express from "express";
import "express-async-errors";
import { json } from "body-parser";
// UVOZIM MONGOOSE
import mongoose from "mongoose";
//

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

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

// BUILD-OVACU OVU FUNKCIJU
const start = async () => {
  // KORISTIM NAME, OBTAINED FROM CLUSTER IP SERVIZE, ZA POD
  // U KOJEM RUNN-UJE MONGOV CONTAINER
  // ALI NE ZABORAVI I PORT ZA DATABASE

  // ZATIM ZADAJ I NAME ZA DATABASE, NA KOJ IZELIS DA SE KONEKTUJES
  // (STAVI auth ,TO JE NAJVISE APPROPRIATE)

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

// OVO OVDE VISE NECE BITI, JER SE ZA TRAFFIC LISTEN-UJE
// TEK AKO IMAS DB CONNECTION
/* const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
 */

// POKRECEM START
start();
