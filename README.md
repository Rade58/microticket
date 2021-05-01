# WRITTING TESTS FOR ORDER CREATION HANDLER

MALO CU SE IGRATI OVDE, I DIGRES-OVACU OD NACINA KOJIM JE POCEO AUTOR WORKSHOPA

JA OCEKUJEM DA CE SVE PROCI PA CU ZA POCETAK NPRAVITI TEST U KOJEM PRAVI MASSERTION DA CE HANDLER RETURN-OVATI STATUS 201

ON JE OVAJ TEST, ZA RAZLIKU OD MENE URADIO NA KRAJU

- `touch orders/src/routes/__test__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";
// MORACEMO MANUELNO DA NAPRAVIMO TICKET, ZATO CE NAM TREBATI
// Ticket MODEL
import { Ticket } from "../../models/ticket.model";

it("returns 201 if order is successfuly created", async () => {
  // PRVO MORAMO KREIRATI TICKET
  const ticket = await Ticket.create({
    title: "tool band",
    price: 69,
  });

  const ticketId = ticket.id;
  const cookie = global.getCookie();
  //
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
      ticketId,
    })
    .expect(201);
});
```

NEMA VEZE STO SI DIGRES-OVAO

- `cd orders`

- `yarn test`

TEST JE PROSAO

## SADA CI DA NAPRAVIM TESTOVE, U KOJIMA CU DA NAPRAVIM ASSERTION U SLUCAJU, KADA TICKET NE POSTOJI, A DRUGI ASSERTION CE SE ODNOSITI NA KADA TICKET ALREADY RESERVED

ZA DRUGI ASSERTION TREBACE NAM Order MODEL DA BI MU UPDATE-OVALI status

- `code orders/src/routes/__test__/new.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";
// TREBACE MI HELPER DA GENERISEM VALIDAN MONGODB ID
import { Types as MongooseTypes } from "mongoose";
// TREBACE MI status ENUM (NA KRAJU MI NIJE TREBALO)
import { OrderStatusEnum } from "@ramicktick/common";

import { Ticket } from "../../models/ticket.model";
// TREBACE MI Order MODEL (I OVO SE POKAZALO DA MI NE TREBA)
import { Order } from "../../models/order.model";
//

// OVO JE ObjectId HELPER, KOJI PRAVI MONGODB DOCUMENT _id
const { ObjectId } = MongooseTypes;


// OVAJ MI JE VEC RANIJE PROSAO
it("returns 201 if order is successfuly created", async () => {
  const ticket = await Ticket.create({
    title: "tool band",
    price: 69,
  });

  const ticketId = ticket.id;
  const cookie = global.getCookie();
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
      ticketId,
    })
    .expect(201);
});


//  -----    OVO SU DALJ ENOVI ASSETIONI KOJE PRAVIM

it("returns 404 if ticket doesn't exist", async () => {
  const ticketId = ObjectId();

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.getCookie())
    .send({
      ticketId,
    })
    .expect(404);
});

it("returns 400 if ticket is reserved", async () => {
  const cookie = global.getCookie();

  // PRAVIMO TICKET
  const ticket = await Ticket.create({
    title: "tool band",
    price: 69,
  });

  const ticketId = ticket.id;

  // KREIRAMO ORDER ZA TIM TICKETOM
  await request(app).post("/api/orders").set("Cookie", cookie).send({
    ticketId,
  });

  // POKUSAVAM ODA PRAVIMO OREDER ZA ISTIM TICKETOM
  await request(app)
    .post("/api/orders")
    .set("Cookie", global.getCookie())
    .send({
      ticketId,
    })
    .expect(400);
});
```

I OVI TESTOVI SU MI PROSLI


**AUTOR WORKSHOPA JE KORISTIO I Order DA NAPRAVI ORDER DOKUMENT, PA JE KORISTIO I OrderStatusEnum ,JA TO NISAM URADIO** 

## TESTIRANJE VEZANO ZA VALIDATION FIELD-OVE NA BODY-JA NECU URADITI

TO SU TESTOVI VEZAN IZA express-validator IMPLEMENTACIJU

OBICNO BI RADIO TO ALI SADA NEMAM VREMENA, A RADI OSAM IH RANIJE, TAKO DA ZNAS STA DA RADIS

# MOGAO BI DA NAPRAVIS TEST KOJIM PRAVIS ASSERTIONS U VEZI DATA-E, KOJ UDOBIJAS U RESPONSE-U, POSTO TI USPESNO IZVRSENI HANDLER VRACA CREATED Order DOKUMENT
