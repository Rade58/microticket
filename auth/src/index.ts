import express from "express";
import { json } from "body-parser";

const app = express();

app.use(json());

// EVO OVO JE RUTE KOJI TREBA DA RETURN-UJE SINGLE USER OBJECT
app.get("/api/users/currentuser", (req, res) => {
  // SAMO ZA SADA STMAPAM DUMMY RESPONSE

  res.send("Hello there, my name is Stavros.");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
});
