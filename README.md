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

it("can only be accessed if user is signed in", async () => {
  const response = await request(app).post("/api/tickets").send({});

  // OVDE MOZES ZASTATI JER MORAMO USTVARI DA IZ SAMOG HANDLER-A THROW-UJEMO
  // ERROR, AKO NE POSTOJI cookie HEADER, U KOJEM JE JWT
});
//

it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});

```

- `code tickets/src/routes/new.ts`

```tsx
import { Router, Request, Response } from "express";

// UVESCU I ONO STO MI DOZVOLJAVA DA THROW-UJEM ERRORS
import "express-async-errors";

// UVOZIM OVAJ MIDDLEWARE, CIJA JE ULOGA DA PROVERI COOKIE
// I D LI JE VALIDNI JSON WEB TOKEN U NJEMU
import { currentUser, NotAuthorizedError } from "@ramicktick/common"; // OVO JE MOJ LIBRARY

const router = Router();

router.post(
  "/api/tickets",
  // MIDDLWEARE CE INSERTOVATI currentUser U req
  // AKO JE SVE VALID
  currentUser,
  async (req: Request, res: Response) => {
    // PRAVIMO USLOVNU IZJAVU
    if (!req.currentUser) {
      throw new NotAuthorizedError();
    }

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

it("can only be accessed if user is signed in", async () => {
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

