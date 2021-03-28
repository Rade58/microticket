import express from "express";
import { json } from "body-parser";

// IMPORTUJEMO ROUTERA
import { currentUserRouter } from "./routes/current-user";
//

const app = express();

app.use(json());

// ASSOCIATE-UJEMO ROUTER-A
app.use(currentUserRouter);
//

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
