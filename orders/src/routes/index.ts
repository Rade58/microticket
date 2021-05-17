import { Router, Request, Response } from "express";
import { requireAuth } from "@ramicktick/common";
import { Order } from "../models/order.model";

const router = Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  // DAKLE requreAuth JE TAJ MIDDLEWARE KOJI PROVERAVA DA
  // LI JE currentUser NA REQUEST-U

  // A DRUGI MIDDLEWARE KOJI INSERT-UJE USERA, STAVIO SAM NA NIVOU
  // CELOG APP-A (currentUser MIDDLEWARE)

  // SADA QUERY-UJEM OZA SVE ORDERS, ALI PREKO USER ID-JA
  // NE OBRACAJ PAZNJU NA ?.  TO SAM MORAO STAVITI ZBOG TYPESCRIPTA
  // JER HANDLER SE ZBOG MIDDLEWARE-A NE BI NI IZVRSIO DA NEMA USER-A

  // DEFINISEM I populate ZA ticket FILELD

  const orders = await Order.find({ userId: req?.currentUser?.id })
    .populate("ticket")
    // .sort({ expirationDate: 1 })
    .exec();

  res.status(200).send(orders);
});

export { router as listAllOrdersRouter };
