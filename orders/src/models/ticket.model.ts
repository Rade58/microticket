import { Schema, model, Document, Model } from "mongoose";
// TREBACE I ONAJ STATUS ENUM
import { OrderStatusEnum as OSE } from "@ramicktick/common";
//
// UVOZIM Order MODEL
import { Order } from "./order.model";

// DOLE ISPOD DEFINICIJE SAME SCHEMA-E CU DA PRVO TYPE-UJEM METODU
// PA CU DA JE DEFINISEM

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
export interface TicketFields {
  title: string;
  price: number;
  userId: string;
}

/**
 * @description interface for things, among others I can search on obtained document
 */
interface TicketDocumentI extends Document, TicketFields {
  // METODU MOGU DA TYPE-UJEM OVDE
  // EVO OVDE PRVO TYPE-UJEM POMENUTU METODU, KOJA CE SE MOCI NA SCHEME
  // DEFINISATI KROZ methods, I KOJU CE ONDA MOCI MODEL KORISTITI
  isReserved: () => Promise<boolean>; // PROMISE JER CE METODA BITI DEFINISANA KAO async
}
/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface TicketModelI extends Model<TicketDocumentI> {
  // ONLY HERE BECAUSE INTERFACE CAN'T BE EMPTY
  __nothing: () => void;
}

// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING) (can be arrow)
// ticketSchema.statics.__nothing = async function (input) {/**/};
// BUILDING  METHODS ON document ( JUST SHOVING) (can't be arrow)
// ticketSchema.methods.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

// DEFINISEM METODU  isReserved
// METODA NE SME BITI ARROW, JER CU INSIDE, KORITITI
// this KEYWORD

ticketSchema.methods.isReserved = async function (): Promise<boolean> {
  // ONU LOGIKU O PROVERI DA LI JE TICKET RESERVED KORISTIMO OVDE

  // ALI PRVO MORAMO UZETI ticketId SA Ticket DOKUMENT-A
  const ticketId = this.id;

  const existingOrder = await Order.findOne({
    ticket: ticketId, // OVDE SI MOGAO STAVITI I SAMO ticket: this
    status: {
      $in: [OSE.created, OSE.awaiting_payment, OSE.complete],
    },
  });

  // SAMO STO SADA KORISTIMO BOOLEAN-E

  if (existingOrder) {
    return true;
  }

  return false;
};

/**
 * @description Ticket model
 */
const Ticket = model<TicketDocumentI, TicketModelI>("Ticket", ticketSchema);

export { Ticket };
