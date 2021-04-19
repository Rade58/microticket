# CONNECTING `tickets` MICROSERVICE SA PRAVOM INSTANCOM MoongoDB-JA

***

DA PRVO ODRADIM SVE PA DA TI KAZEM KOJA SU JOS MOGUCA RESENJA, ZA TO DA SLUCAJNO NE GRESIS SA ZADAVANJEM URI-OVA MONG-OA, ODNOSNO DA NE GRESIS SA KONEKTOVANJE MICROSERVICE-A NA ONAJ DATABSE NA KOJI NE TREBA DA BUDE CONNECTED

***

- `kubectl get services`

```zsh
NAME                TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)     AGE
auth-mongo-srv      ClusterIP   10.68.15.85   <none>        27017/TCP   5d2h
auth-srv            ClusterIP   10.68.9.8     <none>        3000/TCP    5d2h
client-srv          ClusterIP   10.68.2.151   <none>        3000/TCP    5d2h
kubernetes          ClusterIP   10.68.0.1     <none>        443/TCP     22d
tickets-mongo-srv   ClusterIP   10.68.6.247   <none>        27017/TCP   26m
tickets-srv         ClusterIP   10.68.12.30   <none>        3000/TCP    26m
```

- `code tickets/src/index.ts`

POSTO SAM KOPIRAO CODE, IMAM POGRESAN URL, TO ZELI MDA POPRAVIM

```ts
import { app } from "./app";
import mongoose from "mongoose";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }

  try {
    // EVO SAGRADIO SAM PRAVI URL
    // await mongoose.connect(/* "mongodb://auth-mongo-srv:27017/auth" */, {
    await mongoose.connect("mongodb://tickets-mongo-srv:27017/tickets", {
      // KAKO VIDIS GORE ZADAO SAM I NAME ZA DATABASE, NA KOJ IZELIS DA SE KONEKTUJES
      // (STAVIO SAM tickets ,TO JE NAJVISE APPROPRIATE)
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB (tickets-mongo)");
  } catch (err) {
    console.log("Failed to connect to DB");
    console.log(err);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT} INSIDE tickets POD`);
  });
};

start();

```

AKO TI NIJE SKAFFOL POKRENUT POKRENI GA SA `skaffold dev`
