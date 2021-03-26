import express from "express";
import { json } from "body-parser";

const app = express();

app.use(json());

const PORT = 3000;

app.listen(PORT, () => {
  // UMESTO OVOGA
  // console.log(`listening on port ${PORT}`);
  // OVO
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
