import request from "supertest";
import { app } from "../../app";
// TREBACE MI HELPER DA GENERISEM VALIDAN MONGODB ID
import { Types as MongooseTypes } from "mongoose";
// TREBACE MI status ENUM
import { OrderStatusEnum } from "@ramicktick/common";

import { Ticket } from "../../models/ticket.model";
// TREBACE MI Order MODEL
import { Order } from "../../models/order.model";
//

// OVO JE ObjectId HELPER, KOJI PRAVI MONGODB DOCUMENT _id
const { ObjectId } = MongooseTypes;

it("returns 201 if order is successfuly created", async () => {
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
