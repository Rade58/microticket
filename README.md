# PUBLISHING AN EVENT FROM `tickets` MICROSERVICE

MI SMO TAJ PUBLISHING VEC DEFINISALI U NASEM HANDLERU, EVO POGLEDAJ

- `cat tickets/src/routes/new.ts`

```ts
import { Router, Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@ramicktick/common";
import { Ticket } from "../models/ticket.model";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from "../events/nats-wrapper";

const router = Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title")
      .isString()
      .isLength({ max: 30, min: 6 })
      .not()
      .isEmpty()
      .withMessage("title is required"),
    body("price").isFloat({ gt: 0 }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const userId = (req.currentUser as {
      id: string;
      email: string;
      iat: number;
    }).id;

    const ticket = await Ticket.create({ title, price, userId });

    // EVO VIDIS OVO SAM JA DEFINISAO U PROSLOM BRANCH-U
    // I OVIM SAM DEFINISAO PUBLISH-OVANJE
    // EVENT-A SA DATOM CREATED Ticket DOKUMENTA
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    return res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };

```

ALI KAKO DA SUCCESSFULY LISTEN-UJEMO PRILIKOM PUBLISHING-A; USTVARI KKO DA TESTIRAMO DA LI TAJ PUBLISHING USTVARI SALJE EVENT

PA MORAMO IMATI LISTENERA, A CONVINIENTLY, MI SMO GA VEC DEFINISALI JEDANPUT, KADA SMO RADILI NAS SUBPROJECT

EVO GA

- `cat nats_test_project/src/listener.ts`

```ts
import { connect } from "node-nats-streaming";
import { randomBytes } from "crypto";
import { TicketCreatedListener } from "./events/tickets-created-listener";

console.clear();

const stan = connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  // OVO SAM JA ABSTRACT-OVO OUT OVAKO
  const ticketCreatedListener = new TicketCreatedListener(stan);
  ticketCreatedListener.listen();
  // UGLAVNOM, STAMPACE SE DATA EVENTA KADA ON DODJE
  // DAKLE USPESN OCES MOCI DA TESTIRAS

});

process.on("SIGINT", () => {
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});
```

DA ALI MORAMO PRIVREMENO NA EXPOSE-UJEMO NATS STREAMING SERVER TO THE OUTSIDE WORLD JER, JER GORNJI FILE, MI RUNN-UJEM

- `kubectl get pods`

```zsh
NAME                                  READY   STATUS    RESTARTS   AGE
auth-depl-7c986d45d9-5mvh6            1/1     Running   0          11h
auth-mongo-depl-5c78b6dbf7-l7hbq      1/1     Running   0          11h
client-depl-9b4c8bf94-mvc9x           1/1     Running   0          11h
nats-depl-df8968775-jnbxw             1/1     Running   0          11h
tickets-depl-58d78c5c56-8gwxl         1/1     Running   1          11h
tickets-mongo-depl-65cfdd4b79-r9c4x   1/1     Running   0          11h
```

- `kubectl port-forward nats-depl-df8968775-jnbxw 4222:4222`

I MORAMO DA RUNN-UJEMO GORNJI FILE na nasem lokalnom racunaru

- `cd nats_test_project`

- `yarn listen`

## SADA MOZES U INSOMNI DA PRAVIS NOVI REQUEST ZA KREIRANJE TICKETA



**KADA KADA SI TO URADIO, TO JE TAKODJE TREBALO DA PUBLISH-UJE EVENT DO NATS**

A NATS JE ECHO-EVAO EVENT DO LISTENERA

ZATO POGLEDAJ TERMINAL GDE SI POKRENUO LISTENERA I VIDI STA SE STAMPALO
