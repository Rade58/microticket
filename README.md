# ADDING AUTH PTECTION

SADA PISEM ONAJ TEST U KOJE EXPECT-UJEM DA USER BUDE AUTHENTICATED KADA PRAVI REQUEST ZA KREIRANJE NOVOG TICKET-A

- `code tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

// OVO DEFINISEM
it("can't be accessed if user is not signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  // OVDE MOZES ZASTATI JER MORAMO USTVARI DA IZ SAMOG HANDLER-A THROW-UJEMO
  // ERROR, AKO NE POSTOJI cookie HEADER, U KOJEM JE JWT
});
//

it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});

```

**MEDJUTIM TU LOGIKU THROWING-A ERROR, SAM JA VEC DEFINISAO U MIDDLEWARE-U KOJEGG SAM STAVIO U MOJ LIBRARY**

- `code tickets/src/routes/new.ts`

```tsx
import { Router, Request, Response } from "express";

// OVO NE TREBA
import { requireAuth } from "@ramicktick/common"; // OVO JE MOJ LIBRARY

const router = Router();

router.post(
  "/api/tickets",
  // DODAJEM GA
  requireAuth, // ON THROW-UJE CUSTOM ERROR AKO NEM req.currentUser

  async (req: Request, res: Response) => {
    return res.status(201).send({});
  }
);

export { router as createTicketRouter };
```

AKO PROVERIS ONAJ MOJ CUSTOM ERROR, KOJEG SAM KRIRAO DAVNO RANIJE, I KOJEG SAM PUBLISH-OVAO LIBRARY-JU NA NPM-U, MOZES DA VIDIS DA ON RETURN-UJE 401

**TAKO DA CU U TESTU EXPECT-OVATI 401 STATUS CODE, I TAKV ASSERTION CU NAPRAVITI**

- `code tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

//  -------------------------
it("can't be accessed if user is not signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  // OCEKUJEMO 401
  expect(response.status).toEqual(401);
});
//

it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});

```

**TEST JE PROSAO**

***

digresija:

AKO IMAS NEKIH PROBLEMA GDE TI SVI TESTIVI FAIL-UJU, ZAUSTAVI TEST SUITE I ONDA GA PONOVO POKRENI SA `yarn test` (U tickets FOLDERU NARAVNO, JER TO TESTIRAM)

***

# MEDJUTIM MI TREBAMO BOLJI ASSERTION; TREBA DA NAPRAVIMO TVRDNJU PO KOJOJ, MI OCEKUJEMO STATUS CODE 201 ILI 200, AKO JE currentUser TO

MI IMAMO MIDDLWARE, KOJI U RQUEST INSERT-UJE CURRENT USERA, AKO POSTOJI, AKO SE MOZE UZETI IZ JWT-A, KOJI JE PARSED OUT OF COOKIE HEADER

- `code tickets/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";

import { createTicketRouter } from "./routes/new";

// EVO UVEZAO SAM MIDDLEWARE currentUser
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

// STAVICEMO GA OVDE KAKO BI USER BIO PROVIDED (AKO JE AUTHORIZATION OK)
// ZA SLEDECU SERIJU POVEZANIH HANDLER
app.use(currentUser);
// POMENUTI MIDDLEWARE CITI COOKIE, VERIFIKUJE JWT
// I AKO IMAS VALID JWT UZIMA PAYLOAD SA NJEGA I
// INSERT-UJE curretUser INTO req

app.use(createTicketRouter);

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

```

**MEDJUTIM MI MORAMO NEKEKO DA FAKE-UJEMO DA JE COOKIE PROVIDED REQUEST TAK OSTO BI PROVIDE-OVALI COOKIE**

TAKO DA ZA SADA SLEDECEI TEST KOJI BUDEM NAPISAO NECE PROCI, ALI DEFINISACU GA

- `code tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can't be accessed if user is not signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(401);
});

// EVO OVAJ TEST NE BI TREBAL ODA PASS-UJE ZA SADA
it("can be accessed if user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).toEqual(201);
});
// ------------

it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});
```

TEST NARAVNO NIJE PROSAO

## U SLEDECEM BRANCH-U POKAZACU TI KAKO DA FAKEUJES AUTHENTICATION




***


JOS UVEK NISI NISI `CLUSTER IP SERVICE` ZA tickets, POVEZAO SA `INGRESS NGINX`-OM


***

HAJDE PRVO TO DA URADIM

- `kubectl get services`

```zsh
NAME                TYPE        CLUSTER-IP    EXTERNAL-IP   PORT(S)     AGE
auth-mongo-srv      ClusterIP   10.68.15.85   <none>        27017/TCP   5d18h
auth-srv            ClusterIP   10.68.9.8     <none>        3000/TCP    5d18h
client-srv          ClusterIP   10.68.2.151   <none>        3000/TCP    5d18h
kubernetes          ClusterIP   10.68.0.1     <none>        443/TCP     22d
tickets-mongo-srv   ClusterIP   10.68.6.247   <none>        27017/TCP   16h
tickets-srv         ClusterIP   10.68.12.30   <none>        3000/TCP    16h

```

ZANIMA ME DAKLE POSLEDNJI I NJEG CU DA PODESIM U INGRESS CONFIG-U

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
          # DODAO SAM OVO I TO NA OVOM MESTU
          - path: /api/tickets/?(.*)
            pathType: Exact
            backend:
              serviceName: tickets-srv
              servicePort: 3000
          # -------------------------------
          - path: /?(.*)
            pathType: Exact
            backend:
              serviceName: client-srv
              servicePort: 3000
```

SADA SAM BAR SIGURAN DA CE INGRESS ROUTE-OVATI REQUEST DO APPROPRIATE EXPRESS APP-A

