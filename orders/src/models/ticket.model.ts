import { Schema, model, Document, Model } from "mongoose";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

import { Order } from "./order.model";

// DOLE SAM POKUSAO DA PROSIRIM TYPESCRIPT INTERFACE INTERFACE
// STAVLJAJUCI id FIELD
// ALI TI TO I NE TREBAS RADITI
// USTVARI DOBIO SAM TYPESCRIPT ERROR U TOM SLUCAJU

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      /**
       * @param ret object to be returned later as json
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
interface TicketFields {
  // EVO OVDE SAM DODAO id FIELD I IAMO ERROR, I UKLONIO SAM GA
  title: string;
  price: number;
  userId: string;
}

/**
 * @description interface for things, among others I can search on obtained document
 */
export interface TicketDocumentI extends Document, TicketFields {
  isReserved: () => Promise<boolean>; // PROMISE JER CE METODA BITI DEFINISANA KAO async
}
/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface TicketModelI extends Model<TicketDocumentI> {
  // ONLY HERE BECAUSE INTERFACE CAN'T BE EMPTY
  __nothing: () => void;
}

// TEKST OD RANIJE: NE OBRACAJ PAZNJU
// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING) (can be arrow)
// ticketSchema.statics.__nothing = async function (input) {/**/};
// BUILDING  METHODS ON document ( JUST SHOVING) (can't be arrow)
// ticketSchema.methods.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  const ticketId = this.id;

  const order = await Order.findOne({
    ticket: ticketId,
    status: {
      $in: [OSE.created, OSE.awaiting_payment, OSE.complete],
    },
  });

  if (order) {
    return true;
  }

  return false;
};

/**
 * @description Ticket model
 */
const Ticket = model<TicketDocumentI, TicketModelI>("Ticket", ticketSchema);

export { Ticket };
