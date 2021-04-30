# CREATING FEW ROUTE HHANDLERS FOR `orders` MICROSERVICE

EVO GA NEKI INFO O HNDLERIMA KOJE CU PRAVITI

`"GET"` `/api/orders` (USER GLEDA SVE SVOJE ACTIVE ORDERS)

`"GET"` `/api/orders/:orderId` (USER GLEDA DETALJE SPECIFIC ORDER-A)

DAKLE AGAINST THESE HANDLERS SLACE SE REQUEST-OVI FROM OUR FRONT END PART OF APPLICATION

`"POST"` `/api/orders` BODY: `{ticketId: string;}` (USER KREIRA ORDER ZA PURCHASE SPECIFIC TICKET-A)

`"DELETE"` `/api/orders/:orderId` (USER CANCEL-UJE SVOJ SPECIFIC ORDER-A)

DA KREIRAM I FAJLOVE ZA HANDLERE

- `mkdir orders/src/routes`

- `touch orders/src/routes/{index,show,new,delete}.ts`

SKAFFOLDOVACU SVE FAJLOVE (NE MISLIM NA RUNNING SKAFFOLD-A, VEC NA DEFINISANJE NEKOG EXPRESS BOILERPLATE-A)

MOZES OVDE VIDETI STA SAM URADIO

- `cat orders/src/routes/*`

# SADA CEMO DA WIRE-UJEMO OVE ROUTERE, U NASEM APP

- `code orders/src/app.ts`

```ts
import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
// -------- EVO OVO DODAJEM --------
import { listAllOrdersRouter } from "./routes/";
import { deatailsOfOneOrderRouter } from "./routes/show";
import { createNewOrderRouter } from "./routes/new";
import { deleteSingleOrderRouter } from "./routes/delete";
// ---------------------------------

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

// ---- POVEZUJEM, POMENUTE ROUTERE ----
app.use(listAllOrdersRouter);
app.use(deatailsOfOneOrderRouter);
app.use(createNewOrderRouter);
app.use(deleteSingleOrderRouter);
// -------------------------------------

app.all("*", async (req, res, next) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
```

**SADDA KADA POKRENEMO SKAFFOLD, NODE PROCESS U orders MICROSERVICE-U, NE BI VISE TREBALO DA THROW-UJE ERRORS, VEZANE ZA INVALIND IMPORTS**

- `skaffold dev`

OVO SU SADA LOGS KOJE CES VIDETI IZ orders MICROSERVICE-A

```zsh
[orders] 
[orders]           Connected to Nats Streaming Server
[orders]           clientId: orders-depl-5cc5df8bc-8pcnn
[orders]         
[orders] Connected to DB (orders-mongo)
[orders] listening on http://localhost:3000 INSIDE tickets POD
```

DAKLE orders MICROSERVICE FUNKCIONISE
