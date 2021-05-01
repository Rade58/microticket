import { Schema, model, Document, Model } from "mongoose";
import { TicketFields } from "./ticket.model";

// ZELIM DA DAKLE DA REDEFINISEM MALO ENUM
// EVO PREBACIO SAM GA OVDE
enum StatusEnum {
  pending = "pending",
  expired = "expired",
  paid = "paid",
}

const { ObjectId, Date: MongooseDate } = Schema.Types;

const orderSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    status: {
      type: String,
      // UMESTO HARDCODING-A,
      // enum: ["pending", "expired", "paid"],
      // SIGURNIJE JE OVAKO URADITI

      enum: [StatusEnum.pending, StatusEnum.expired, StatusEnum.paid],
      required: true,
    },
    expiresAt: {
      type: MongooseDate,
    },
    ticket: {
      type: ObjectId,
      ref: "Ticket",
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
      },
    },
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface OrderFields {
  userId: string;
  status: StatusEnum;
  expiresAt: string;
  ticket: TicketFields;
}

/**
 * @description interface for things, among others, I can search on obtained document
 */
interface OrderDocumentI extends Document, OrderFields {
  //
}

/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface OrderModelI extends Model<OrderDocumentI> {
  // NECU NISTA DODAVATI, ALI OVDE BI TYPE-OVAO STATICKE METODE KOJE
  // SAMO TI OSTAVLJAM OVO KAO TEMPLATE DEFINISANJA
  __nothing: (input: string) => void; //stavio samo jer moram nesto da dodam, ali ovu metodu necu sigurno definisati
}

// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING NOT GOING TO USE IT )
// ticketSchema.statics.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

const Order = model<OrderDocumentI, OrderModelI>("Order", orderSchema);

export { Order };