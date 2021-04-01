# CONNECTING TO MONGODB

KREIRAO SI DEPLOYMENT OBJECT I CLUSTER IP SERVICE ZA MONGODB; STO ZNACI DA IMAS INSTANCU MONGO-A, KOJA RUNN-UJE U JEDNOM POD-U U TVOM CUBENETES CLUSTERU

# MEDJUTIM, NIJE IDELANA STVAR, PO KOJOJ AKO MI RESTART-UJEMO POD, U KOJEM JE NAS MONGODB; ILI DELET-UJEMO TAJ POD, MI CEMO ZAUVEK IZGUBITIT DATA TOG DATBASE-A

O OVOME CU DETALJNO GOVORITI KASNIJE, I PONUDICU RESENJE ZA POMENUTI PROBLLEM

A TO S TICE LIFECYCLE POD-OVA INSIDE OF CLUSTER

JA CU SE DAKLE OVIM POSEBNO POZABAVITI I TADA CU OTKRITI ZASTO LOSE-UJEMO DATA I FIGURE-OVATI SOME WAYS TO SOLVE THIS, DAJUCI MONGODB-JU PERSISTANT STORAGE

# SADA ZALIM DA SE IZ MOG, TRENUTNO JEDINOG MICROSERVICE-A CONNECT-UJEM NA TAJ DATABASE

POSTO IMAM CLUSTER IP SERVICE, POTREBNO JE DA OBTAIN-UJEM NAME CLUSTER IP SERVICE-A

- `kubectl get services`

```zsh
NAME             TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)     AGE
auth-mongo-srv   ClusterIP   10.68.2.50    <none>        27017/TCP   80m
auth-srv         ClusterIP   10.68.1.240   <none>        3000/TCP    4d5h
kubernetes       ClusterIP   10.68.0.1     <none>        443/TCP     5d
```

IP JE U OVOM SLUCAJU `auth-mongo-srv` (A OVO SI MOGAO NACI I U RELATED CONFIG FILE-U)

- `code auth/src/index.ts`

```ts
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

```
