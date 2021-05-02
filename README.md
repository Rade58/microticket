# BUILDING HANDLER FOR FETCHING INDIVIDUAL ORDER

OVDE JE BITNO RECI DA BI TREBA ODA NAPRAVIM HANDLER TAK ODA AUTHENTICATED USER MOGU DA UZMO ORDER

ALI USER SAMO MOZE OBTAIN-OVATI ORDER KOJI JE KREIRAO

- `code orders/src/routes/show.ts`

```ts
import { Router, Request, Response } from "express";
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
} from "@ramicktick/common";
// PORED SVEGA ZELI MI DA PROVERIM DA LI JE orderId VALID
// ZATO SAM UVEZAO OVAJ HELPER
import { isValidObjectId } from "mongoose";
//
import { Order } from "../models/order.model";

const router = Router();

router.get(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    // PROVERAVAMO DA LI JE VALID MONGODB ID
    if (!isValidObjectId(orderId)) {
      throw new Error("Invalid mongodb id");
    }

    // POKUSAVAMO DA UZMEMO ORDER
    const order = await Order.findOne({ _id: orderId })
      .populate("ticket")
      .exec();

    if (!order) {
      throw new NotFoundError();
    }

    // AKO USER NIJE AUTHORIZED
    if (order.userId !== req?.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    console.log(order);

    res.status(200).send(order);
  }
);

export { router as deatailsOfOneOrderRouter };
```

## EVO NAPISAO SAM I TESTOVE

- `touch orders/src/routes/__test__/show.test.ts`

```ts
import request from "supertest";
import { Types } from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";

const { ObjectId } = Types;

// HELPERI
const createOrders = async (
  ticketIds: number[],
  numOfOrders: number,
  cookie: string[]
) => {
  const orderIds = [];

  // CREATING SOME ORDERS
  for (let i = 0; i < numOfOrders; i++) {
    const response = await request(app)
      .post("/api/orders")
      .set("Cookie", cookie)
      .send({ ticketId: ticketIds[i] });

    orderIds.push(response.body.id);
  }

  return orderIds;
};

const createTickets = async (num: number) => {
  //
  const ticketIds = [];

  for (let i = 0; i < num; i++) {
    const ticket = await Ticket.create({
      price: 69,
      title: "tooll band",
    });

    ticketIds.push(ticket.id);
  }

  return ticketIds;
};
// ---------------------------------------------------

it("returns 200 if order is obtained by id", async () => {
  const cookie = global.getCookie();

  const ticketIds = await createTickets(8);

  const orderIds = await createOrders(ticketIds, 6, cookie);

  // GETTING ORDER BY ID

  const response = await request(app)
    .get(`/api/orders/${orderIds[0]}`)
    .set("Cookie", cookie)
    .send()
    .expect(200);

  // PROVERICEMO TAKODJE DA LI JE POPULATED ticket FIELD
  // NAMERNO SAM TO URADIO NA NACIN KAKAV JE DOLE, CISTO
  // DA PROBVAM RAZLICITE METODE, OVOG PUTA AM PTOBAO
  // toBeTruthy

  expect(response.body.ticket.price).toBeTruthy();
});

it("it returns 404 if there is no order for provided id", async () => {
  await request(app)
    .get(`/api/orders/${ObjectId()}`)
    .set("Cookie", global.getCookie())
    .send()
    .expect(404);
});

it("returns 401 if user is asking for order, not belonging to him", async () => {
  // USER ONE
  const cookie1 = global.getCookie();
  // USER TWO
  const cookie2 = global.getOtherCookie({
    email: "stavroscool@stavros.com",
    id: "adasfsfsdsdg",
  });

  // CREATING TICKETS

  const ticketIds = await createTickets(1);

  // CREATING ORDERS
  const orderIds = await createOrders(ticketIds, 1, cookie1);

  await request(app)
    .get(`/api/orders/${orderIds[0]}`)
    // OTHER USER IS TRYING TO OBTAIN AN ORDER OF ANOTHER USER
    .set("Cookie", cookie2)
    .send()
    .expect(401);
});

it("returns 400 if order id is not valid mongodb id", async () => {
  await request(app)
    // STAVICU OVDE NAVALIDAN ID
    .get("/api/orders/124ab")
    // OTHER USER IS TRYING TO OBTAIN AN ORDER OF ANOTHER USER
    .set("Cookie", global.getCookie())
    .send()
    .expect(400);
});
```

- `cd orders`

- `yarn test` `p` `Enter` show `Enter`

**I PROSLA SU SVA CETIRI TESTA**
