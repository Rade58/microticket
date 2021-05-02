import request from "supertest";
import { app } from "../../app";
import { Types as MongooseTypes } from "mongoose";
import { OrderStatusEnum } from "@ramicktick/common";

import { Ticket } from "../../models/ticket.model";
import { Order } from "../../models/order.model";

// KAO STO ZNAS OVDE CE BITI SERVIRN MOCK
import { natsWrapper } from "../../events/nats-wrapper";
//

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

  const ticket = await Ticket.create({
    title: "tool band",
    price: 69,
  });

  const ticketId = ticket.id;

  await request(app).post("/api/orders").set("Cookie", cookie).send({
    ticketId,
  });

  await request(app)
    .post("/api/orders")
    .set("Cookie", global.getCookie())
    .send({
      ticketId,
    })
    .expect(400);
});

it("publishes event to order:created channel", async () => {
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

  // DAKLE TREBAO JE DA SE PUBLJISH-UJE EVENT, TOKOM IZVRSAVANJA GORNJEG
  // HANDLERA, A TO PROVERAVAMO OVAKO
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
