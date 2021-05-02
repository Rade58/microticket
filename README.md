# BUILDING HANDLER FOR CANCELLING THE ORDER

MI USTVARI NECEMO DEFINISATI DEKLET-OVANJE DOKUMENT-A IZ DATABASE-A, VEC CEMO DEFINISATI UPDATING STATUS FIELDA, DA MU VREDNOST BUDE `"cancelled"`

I TAKODJE VAZNA STVAR JE DA SAMO USER KOJI JE KREIRAO ORDER, MOZE DA GA I DELETE-UJE, ODNONO DA PROMEN ITAJ STATUS

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

router.delete(
  "/api/orders/:orderId",
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    if (isValidObjectId(orderId)) {
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
      { status: OSE.cancelld }
    )
      .populate("ticket")
      .exec();

    res.status(201).send(order);
  }
);

export { router as deleteSingleOrderRouter };
```

**POSTAVLJ SE PITNJE ZASTO JE HTTP METHOD USTVARI `"DELETE"`, IAKO MI NISTA USTVARI NE DELETE-UJEMO IZ DATBASE**

IMALO BI VISE SMISLA DA JE TO `"PUT"` ILI `"PATCH"`

ALI NEMA VEZE, JA CU IPAK OSTAVITI DA JE TO `"DELETE"`

