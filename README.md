# CREATING `Order` MODEL INSIDE `payments` MICROSERVICE

- `mkdir payments/src/models`

- `touch payments/src/models/order.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

const orderSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OSE),
      default: OSE.created,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    toJSON: {
      /**
       *
       * @param doc
       * @param ret object to be returned later as json
       * @param options
       */
      transform(doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },

    optimisticConcurrency: true,
    versionKey: "version",
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface OrderFields {
  version: number;
  userId: string;
  status: OSE;
  price: number;
}

/**
 * @description interface for things, among others, I can search on obtained document
 */
export interface OrderDocumentI extends Document, OrderFields {
  //
}

/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface OrderModelI extends Model<OrderDocumentI> {
  /**
   * 
   * @param event just "id" and "version"
   * @description finds order by id and decremented version
   */
  findOneByEvent(event: {
    id: string;
    version: number;
  }): Promise<OrderDocumentI | null>;
}

// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING NOT GOING TO USE IT )
// orderSchema.statics.__nothing = async function (input) {/**/};
// pre HOOK
// orderSchema.pre("save", async function (next) {/**/});
// METHODS ON DOCUMENT
// orderSchema.methods.

orderSchema.statics.findByEvent = async function (event: {
  id: string;
  version: number;
}) {
  const { id, version } = event;

  const order = await this.findOne({ _id: id, version: version - 1 });

  return order;
};

const Order = model<OrderDocumentI, OrderModelI>("Order", orderSchema);

export { Order };

```

