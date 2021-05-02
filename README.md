# BUILDING HANDLER FOR GETTING ALL ORDERS

**ORDERS CE SE UZIMATI BY USER ID, JER SAMO USER KOJI JE NAPRAVIO ORDER TREBA DA BUDE U MOGUCNOSTI DA GA ACCESS-UJE**

***

**SAMO DA TI KAZEM DA CU OVDE UPOTREBITI I `populate` METODU, DA BI POPULATE-OVAO ONAJ FIELD, KOJI JE REFERENCA DRUGOG DOKUMENTA IZ DATNBASE-A**

***

NAPRAVIO SAM `tickets/src/routes/new.ts`, A SADA CU DA NAPRAVIM I DRUGE HANDLER-E

- `code orders/src/routes/index.ts`

```ts
import { Router, Request, Response } from "express";
import { requireAuth } from "@ramicktick/common";
import { Order } from "../models/order.model";

const router = Router();

router.get("/api/orders", requireAuth, async (req: Request, res: Response) => {
  // DAKLE requreAuth JE TAJ MIDDLEWARE KOJI PROVERAVA DA
  // LI JE currentUser NA REQUEST-U

  // A DRUGI MIDDLEWARE KOJI INSERT-UJE USERA, STAVIO SAM NA NIVOU
  // CELOG APP-A (currentUser MIDDLEWARE)
  // 

  // SADA QUERY-UJEM OZA SVE ORDERS, ALI PREKO USER ID-JA
  // NE OBRACAJ PAZNJU NA ?.  TO SAM MORAO STAVITI ZBOG TYPESCRIPTA
  // JER HANDLER SE ZBOG MIDDLEWARE-A NE BI NI IZVRSIO DA NEMA USER-A

  // DEFINISEM I populate ZA ticket FILELD

  const orders = await Order.find({ userId: req?.currentUser?.id })
    .populate("ticket")
    .exec();

  res.status(200).send(orders);
});

export { router as listAllOrdersRouter };
```
