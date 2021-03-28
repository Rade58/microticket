import express from "express";
import { json } from "body-parser";

import { currentUserRouter } from "./routes/current-user";
// IMPORTUJEMO
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup";

const app = express();

app.use(json());

app.use(currentUserRouter);
// ASSOCIATE-UJEMO OSTALE ROUTER-E
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
