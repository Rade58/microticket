# INITIAL SETUP FOR `payments` MICROSERVICE

DAKLE OPET DUPLICATE-UJEM A LOT OF STUFF FROM OTHER MICROSERVICE DA BI NAPRAVIO OVAJ (MOZES KORISTITI tickets MICROSERVICE ZA TA INICIJALNA KOPIRANJA FAILE-OVA KOJI SU ISTI U SVIM MICROSERVICE-OVIMA)

- `mkdir -p payments/src/events`

NAKON KOPIRANJA IMAM OVO

- `ls -a payments/`

```zsh
Dockerfile  .dockerignore  package.json  src  tsconfig.json
```

- `ls -a payments/src`

```zsh
app.ts  events  index.ts  test
```

- `ls -a payments/src/events`

```zsh
__mocks__  nats-wrapper.ts
```

- `ls -a payments/src/test`

```zsh
setup.ts
```

# PREPRAVLJAMO SAMO name U package.json

- `code package.json`

```json
{
"name": "payments",
// ...
``` 

# IZ `index.ts` UKLANJAMO SVE LISTENER UVOZE I NJIHOVO INSTATICIZIRANJE, I LISTENING

TAKO DA CE FILE SADA IZGLEDATI OVAKO

- `code payments/src/index.ts`

```ts
import { app } from "./app";
import mongoose from "mongoose";
import { natsWrapper } from "./events/nats-wrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI env variable undefined");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID env variable is undefined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID env variable is undefined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL env variable is undefined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID as string,
      process.env.NATS_CLIENT_ID as string,
      {
        url: process.env.NATS_URL,
      }
    );

    console.log("Connected to nats streaming server");

    const sigTerm_sigInt_callback = () => {
      natsWrapper.client.close();
    };
    process.on("SIGINT", sigTerm_sigInt_callback);
    process.on("SIGTERM", sigTerm_sigInt_callback);

    natsWrapper.client.on("close", () => {
      console.log("Connection to NATS Streaming server closed");
      process.exit();
    });

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB (payments-mongo)");
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

# IZ `app.ts` UKLANJAMO SVE USED ROUTERS

- `code payments/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { errorHandler, NotFoundError, currentUser } from "@ramicktick/common";

const app = express();

app.set("trust proxy", true);

app.use(json());

app.use(
  cookieSession({
    signed: false,

    secure: process.env.NODE_ENV !== "test",
  })
);

app.use(currentUser);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
```

# MOZEMO DA INSTALIRAMO DEPENDANCIES

- `cd payments`

- `yarn`

# DOCKER IMAGE NE PRAVIMO, I NE PUSH-UJEMO, JER KAO STO SAM TI REKAO, MNOGO PUTA RANIJE, MI IMAMO CUSTER NA GOOGLE CLOUD-U, I ZBOG TOGA TO NE MORAMO DA RADIMO

A AKO KORISTIS MINICUBE RADIO BI OVO

- `cd payments`

- `docker build -t radebajic/payments .`

- `docker push radebajic/payments`

OPET TI NA POMEINJEM DA NE RADIS OVO, AKO KORISTIS GOOGLE CLOUD, A JA UPRAVO IMAM CLUSTER NA GOOGLE CLOUD-U

# STO SE TICE K8S SETUPA- KRENUCU OD SKAFFOLD CONFIG-A

- `code skaffold.yaml`

```yaml
apiVersion: skaffold/v2beta12
kind: Config
deploy:
  kubectl:
    manifests:
      - ./infra/k8s/*
build:
  googleCloudBuild:
    projectId: microticket
  artifacts:
    - image: eu.gcr.io/microticket/auth
      context: auth
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
    - image: eu.gcr.io/microticket/client
      context: client
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: '**/*.{tsx,ts,js}'
            dest: .
    - image: eu.gcr.io/microticket/tickets
      context: tickets
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
    - image: eu.gcr.io/microticket/orders
      context: orders
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
    - image: eu.gcr.io/microticket/expiration
      context: expiration
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
    # EVO OVO SAM DODAO
    - image: eu.gcr.io/microticket/payments
      context: payments
      docker:
        dockerfile: Dockerfile
      sync:
        manual:
          - src: 'src/**/*.{ts,js}'
            dest: .
```

# SADA CU DA KREIRAM DEPLOYMENT I CLUSTER IP CONFIGS

- `touch infra/k8s/payments-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  # OVO JE VAZNO, VIDECES I ZASTO
  name: payments-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: payments
  template:
    metadata:
      labels:
        app: payments
    spec:
      containers:
        - name: payments
          image: eu.gcr.io/microticket/payments
          env:
            - name: NATS_CLIENT_ID
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
            - name: NATS_URL
              value: 'http://nats-srv:4222'
            - name: NATS_CLUSTER_ID
              value: microticket
            - name: MONGO_URI
              value: 'mongodb://payments-mongo-srv:27017/payments'
            - name: JWT_KEY
              valueFrom:
                secretKeyRef:
                  name: jwt-secret
                  key: JWT_KEY
---
apiVersion: v1
kind: Service
metadata:
  name: payments-srv
spec:
  selector:
    app: payments
  type: ClusterIP
  ports:
    - name: payments
      protocol: TCP
      port: 3000
      targetPort: 3000

```

# SADA CU DA DODAM I DEPLOYMENT CONFIG ZA MONGODB, KOJI CE BITI TIED TO `payments` MICROSERVICE

- `touch infra/k8s/payments-mongo-depl.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: payments-mongo-depl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: payments-mongo
  template:
    metadata:
      labels:
        app: payments-mongo
    spec:
      containers:
      - name: payments-mongo
        image: mongo
---
apiVersion: v1
kind: Service
metadata:
  name: payments-mongo-srv
spec:
  selector:
    app: payments-mongo
  type: ClusterIP
  ports:
    - name: db
      protocol: TCP
      port: 27017
      targetPort: 27017
```

# SADA MOZEMO DA DODAMO ROUTE ZA payments INSIDE INGRESS NGINX CONFIG-A

- `code infra/k8s/ingress-srv.yaml`

```yaml
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  name: ingress-srv
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  rules:
    - host: microticket.com
      http:
        paths:
          - path: /api/users/?(.*)
            pathType: Exact
            backend:
              serviceName: auth-srv
              servicePort: 3000
          - path: /api/tickets/?(.*)
            pathType: Exact
            backend:
              serviceName: tickets-srv
              servicePort: 3000
          - path: /api/orders/?(.*)
            pathType: Exact
            backend:
              serviceName: orders-srv
              servicePort: 3000
          # DODAO SAM OVO I TO NA OVOM MESTU
          # I SAM ZNAS ZASTO NE SME NA ZADNJEM MESTU (NECU DA SE PONAVLJAM 100 PUTA)
          #
          - path: /api/payments/?(.*)
            pathType: Exact
            backend:
              serviceName: payments-srv
              servicePort: 3000
          #
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```
