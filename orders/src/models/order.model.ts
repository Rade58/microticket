import { Schema, model, Document, Model } from "mongoose";
import { TicketDocumentI } from "./ticket.model";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

const { ObjectId, Date: MongooseDate } = Schema.Types;

// EVO POGLEDAJ OPTIONS ARGUMENT SCHEMA-E, UPRAVO
// SE TU PODESAVAJU POMENUTE STVARI
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
        delete ret.__v;
      },
    },
    // DODAO I OVO
    optimisticConcurrency: true,
    versionKey: "version",
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface OrderFields {
  // DODAO I OVO
  version: number;
  //
  userId: string;
  status: OSE;
  expiresAt: string;
  ticket: TicketDocumentI;
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
