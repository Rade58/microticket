import { Schema, model, Document, Model } from "mongoose";
import { OrderDocumentI } from "./order.model";

const { ObjectId } = Schema.Types;

const paymentSchema = new Schema(
  {
    order: {
      // OVO NIJE MORAO DA BUDE REF ,ALI JA SAM GA IPAK DEFINISAO
      type: ObjectId,
      ref: "Order",
      required: true,
    },
    stripeChargeId: {
      type: String,
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
    // POSTO SE CHARING ZA NEKI ORDER OBAVLJA SAMO JEDNOM
    // MI NIKADA NECEMO UPDATE-OVATI Payment DOKUMENT
    // ZATO OVO NIJE POTREBNO
    /* optimisticConcurrency: true,
    versionKey: "version",
    */
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface PaymentFields {
  stripeChargeId: string;
  order: OrderDocumentI;
  // OVO NECE POSTOJATI DAKLE
  // version: number;
}

/**
 * @description interface for things, among others, I can search on obtained document
 */
export interface PaymentDocumentI extends Document, PaymentFields {
  //
}

/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface PaymentModelI extends Model<PaymentDocumentI> {
  __nothing: () => void;
}

// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING NOT GOING TO USE IT )
// paymentSchema.statics.__nothing = async function (input) {/**/};
// pre HOOK
// paymentSchema.pre("save", async function (next) {/**/});
// METHODS ON DOCUMENT
// paymentSchema.methods.

const Payment = model<PaymentDocumentI, PaymentModelI>(
  "Payment",
  paymentSchema
);

export { Payment };
