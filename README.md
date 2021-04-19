# CREATING A ROUTER

DAKLE JA SADA IMAM TESTS BACK IN MY MIND DOK SVE BUDEM DEFINISAO, UVEK DAKLE IDEM PRINCIPOM DA MORAM DA ZADOVOLJIM TSTS

- `cat tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  // MENE SADA ZANIMA OVO
});

it("can only be accessed if user is signed in", async () => {});
it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});

```

NEMAS NI JEDAN HANDLER ZA SADA U tickets MICROSERVICE-U

ALI TO BAS I NIJE TAKO, JER SI KOPIRAO SILNI CODE, I U TOM CODE-U TI SI PODESIO HANDLER ZA CATCH ALL ROUTES

- `cat tickets/src/app.ts`

```ts
// ...
app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});
//...
```

TO ZNACI DA AKO POSALJES REQUEST, PREMA tickets MICROSERVICE-U NA BILO KOJEM ROUTE-U, TI CES DOBITI 404 ERROR

**SAD CU NAPISATI TEST, I OCEKUJEM DA PRVI TEST NECE PASS-OVATI, JER CU DOBITI 404**

- `code tickets/src/routes/__tests__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("has a route handler listening on /api/tickets for post requests", async () => {
  // EVO STA DEFINISEM, MISLIM DA JI JE JASNO STA SAM URAIO
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed if user is signed in", async () => {});
it("it returns an error if invalid 'title' is provided", async () => {});
it("it returns an error if invalid 'price' is provided", async () => {});
it("it creates ticket with valid inputs", async () => {});

```

**I ZAIST TEST NIJE PROSAO,, JER SE ZAISTA DOBIJA STATUS CODE 404**

## SADA CU DA DEFINISEM HANDLER-A, JER UPRAVO MI JE TEST UKAZAO DA TO MORAM KREIRATI

- `touch tickets/src/routes/new.ts`

```ts
import { Router } from "express";

const router = Router();

router.post("/api/tickets", async (req, res) => {
  return res.status(201).send({});
});

export { router as newRouter };

```








***
***
***
***

OPET BITNA STVAR, NEIJE BITAN NGINX, JER TI SAMO MOZES DA TESTIRAS LOKALNO, NEMA CLUSTER-A U OVOM SLUCAJU


***
***
***
***

ALI TI NI TO NECES DOBITI, JER NISI `CLUSTER IP SERVICE` ZA tickets, POVEZAO SA `INGRESS NGINX`-OM

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
