# BUILDING HANDLER FOR CANCELLING THE ORDER

MI USTVARI NECEMO DEFINISATI DEKLET-OVANJE DOKUMENT-A IZ DATABASE-A, VEC CEMO DEFINISATI UPDATING STATUS FIELDA, DA MU VREDNOST BUDE `"cancelled"`

I TAKODJE VAZNA STVAR JE DA SAMO USER KOJI JE KREIRAO ORDER, MOZE DA GA I DELETE-UJE, ODNONO DA PROMEN ITAJ STATUS

AUTOR WORKSHOPA JE ZELO DA DEFINISE DA HTTP METHOD BUDE `"DELETE"`

**POSTAVLJA SE PITNJE ZASTO JE STAVIO HTTP METHOD, DA BUDE, USTVARI `"DELETE"`, IAKO MI NISTA USTVARI NE DELETE-UJEMO IZ DATABASE**

IMALO BI VISE SMISLA DA JE TO `"PUT"` ILI `"PATCH"`, I ON JE TO KASNIJE REKAO

JA SAM IPAK DEFINISAO DA DA TO BUDE `"PATCH"`

***

digresija:

KADA TI JE METHOD `"DELETE"`, ONDA JE DOBRO DA SENDUJES `204` STATUS CODE

***

- `code orders/src/routes/delete.ts`

```ts
import { Router, Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  requireAuth,
  OrderStatusEnum as OSE,
} from "@ramicktick/common";
import { isValidObjectId } from "mongoose";
import { Order } from "../models/order.model";

const router = Router();

router.patch(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      throw new BadRequestError("order id is invalid mongodb object id");
    }

    // PRONALAZENJE DOKUMENT
    let order = await Order.findOne({ _id: orderId }).exec();

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req?.currentUser?.id) {
      throw new NotAuthorizedError();
    }

    // MENJANJE STATUSA ORDERU

    order = await Order.findOneAndUpdate(
      { _id: orderId },
      { status: OSE.cancelld },
      { new: true, useFindAndModify: true }
    )
      .populate("ticket")
      .exec();

    console.log({ order });

    res.status(200).send(order);
  }
);

export { router as deleteSingleOrderRouter };
```



# SADA CEMO DA PISEMO TESTS ZA GORNJI HANDLER

- `touch orders/src/routes/__test__/delete.test.ts`

```ts
import request from "supertest";
import { Types } from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket.model";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

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

it("returns 201 if order is cancelled, and making sure that status field is really 'cancelled'", async () => {
  const cookie = global.getCookie();

  const ticketIds = await createTickets(8);

  const orderIds = await createOrders(ticketIds, 6, cookie);

  // CANCELLING

  const response = await request(app)
    .patch(`/api/orders/${orderIds[0]}`)
    .set("Cookie", cookie)
    .send();

  expect(response.status).toEqual(200);

  // PROVERAVAM populate
  expect(response.body.ticket.price).toBeTruthy();

  // PROVEVAM status
  expect(response.body.status).toEqual(OSE.cancelld);

  // JOS BOLJA POTVRDA DA JE status, SADA cancelled
  const response2 = await request(app)
    .get(`/api/orders/${orderIds[0]}`)
    .set("Cookie", cookie)
    .send();

  expect(response2.body.status).toEqual(OSE.cancelld);
});

it("it returns 404 if there is no order for provided id", async () => {
  await request(app)
    .get(`/api/orders/${ObjectId()}`)
    .set("Cookie", global.getCookie())
    .send()
    .expect(404);
});

it("returns 401 if user is wanting to cancel order, not belonging to him", async () => {
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
    .patch(`/api/orders/${orderIds[0]}`)
    // OTHER USER IS TRYING TO CANCEL AN ORDER OF ANOTHER USER
    .set("Cookie", cookie2)
    .send()
    .expect(401);
});

it("returns 400 if order id is not valid mongodb id", async () => {
  await request(app)
    // STAVICU OVDE NAVALIDAN ID
    .patch("/api/orders/124ab")
    .set("Cookie", global.getCookie())
    .send()
    .expect(400);
});
```

- `cd orders`

- `yarn test` p `Enter` delete `Enter`

**SVA CETIRI TESTA SU PROSLA**
