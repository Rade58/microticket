# CONNECTING `tickets` MICROSERVICE SA PRAVOM INSTANCOM MoongoDB-JA; MAKING URI THROUGH ENV VARIABLES

DA PRVO ODRADIM SVE "MANUELNO", ODNOSNO DA FORMIRAM URI TAKO STO CU GA HARDCODE-OVATI U CODEBASE, PA DA TI KAZEM KOJA SU JOS MOGUCA RESENJA, ZA TO DA SLUCAJNO NE GRESIS SA ZADAVANJEM URI-OVA MONG-OA, ODNOSNO DA NE GRESIS SA KONEKTOVANJE MICROSERVICE-A NA ONAJ DATABSE NA KOJI NE TREBA DA BUDE CONNECTED

NAKON STO URADIM, THE HARDOCEDED WAY; **PODESAVACU KONFIGURACIJE ZA ENV VARIJALU**

# HARDCODING MONGODB URI INTO OUR CODEBASE

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

AKO TI NIJE SKAFFOLD POKRENUT POKRENI GA SA `skaffold dev`

I VIDECES DA SI USPESNO CONNECTED, NA APPROPRIATE DATBASE

# PODESAVANJE MONGODB URI AS A ENV VARIABLE, ODNOSNO HARDCODING IT INTO CONFIG FILE

*TI SI RANIJE VEC PROBAO OVAKO NESTO, SAMO STO SI JOS MORAO DEFINISATI DODATNU STVAR, A TO JE DA SI MORAO KREIRATI SECRET K8S OBJECT, U KOJM JE TVOJ SECRET, PA SI PODESAVANJEM KONFIGURACIJE PULL-OVAO VREDNOST IZ SECRET-A, DA TA VREDNOST BUDE ENV VARIABLE U TVOM NODE ENVIROMENTU U MICROSERVICE-U* ([SECURELY STORING SECRETS WITH KUBERNETES](https://github.com/Rade58/microticket/tree/2_5_SECURELY_STORING_SECRETS_WITH_KUBERNETES#securely-storing-secrets-with-kubernetes))

**E PA OVOG PUTA NECEMO KORISTITI SECRET OBJECTS** (`NEMA POTREBE DA STORE-UJEMO MONGODB URI AS A SECRET`), SAMO CEMO PODESITIT NOVU ENV VARIABLE INSIDE DEPLOYMENT CONFIGA ZA tickets MICROSERVICE

SPECIFICIRACEMO NOVU VATRIJABLU `MONGO_URI`

- `code infra/k8s/tickets-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: tickets-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: tickets
  template:
    metadata:
      labels:
        app: tickets
    spec:
      containers:
        - name: tickets
          image: eu.gcr.io/microticket/tickets
          env:
            # EVO OVO SAM ZADAO
            - name: MONGO_URI
              # EVO JE VREDNOST URI
              value: 'mongodb://tickets-mongo-srv:27017/tickets'
            #
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
---
apiVersion: v1
kind: Service
metadata:
  name: tickets-srv
spec:
  selector:
    app: tickets
  type: ClusterIP
  ports:
    - name: tickets
      protocol: TCP
      port: 3000
      targetPort: 3000

```

# KORISTIMO REFERENCU ENV VARIAJBLE

- `code tickets/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }
  // OVDE MOZEMO DA NAPRAVIMO I PROVERU ZA MONGO_URI ENV VARIABLE
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI env variable undefined");
  }

  try {
    // UMESTO OVOGA
    // await mongoose.connect("mongodb://tickets-mongo-srv:27017/tickets", {
    // KORISTIMO ENV VARIABLU
    await mongoose.connect(process.env.MONGO_URI, {
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

I SVE JE OK, U SKAFFOLD OUTUTU MOGU VIDETI LOG O USPESNOJ KONEKCIJI

CISTO DA OPET TESTIRAS DA LI SE KONEKTUJES NA PRAVI MONGO, UDJI U YAML FILE I COMMENT-UJ OUT, ONU PODESENU ENV VARIABLU

- `code`

```yaml
# ...
env:
  # - name: MONGO_URI
    # value: 'mongodb://tickets-mongo-srv:27017/tickets'
  - name: JWT_KEY
    valueFrom:
      secretKeyRef:
        name: jwt-secret
        key: JWT_KEY
# ...
```

POGLEDAJ SADA SKAFFOLD-OUV OUTPUT; BICE THROWN ONAJ ERROR ` UnhandledPromiseRejectionWarning: Error: MONGO_URI env variable undefined`, STO SI I ZADAO DA SE THROW-UJE AKO NEMA POMENUTE ENV VARIABLE

SADA TI OVO GORE UNCOMMENT-UJE I OPET SAVE-UJ YAML FILE I PUSTI SKAFFOLD DA ODRADI SVOJE, KAKO BI PONOVO DOSAO DO CORRECT SITUACIJE, JER OVO GORE SAM SAMO URADIO U CILKU TESTIRANJA

# DA LI JE PROBLEM STO SI TI HARDCODE-OVAO URL U CONFIG FILE-U, ODNOSNO YAML FILE-U, KOJI CE BITI COMMITED TO GIT

NIJE PROBLEM, JER JE DATABASE, PREKO POMENUTOG URI ONLY ACCESSIBLE, AKO JE NEKO U NASEM CLUSTERU

**JEDINO DA SI U URI-U PODESIO USERNAME I PASSWORD DATBASE ADMIN-A (DA I TO SE MOZE PODESAVATI, CAK SAM TO RANIJE PODESAVAO), TO NE BI TREBALO DA COMMIT-UJES TO GIT, `ALI TADA BI URI PROVIDE-OVAO KROZ SECRET OBJECT, BAS KAO STO SI RADIO SA JSON WEB TOOKEN KEY-OM`**


