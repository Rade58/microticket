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

```

- `cd orders`

- `yarn test` p `Enter` delete `Enter`
