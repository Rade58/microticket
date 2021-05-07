import { Schema, model, Document, Model } from "mongoose";
import { OrderStatusEnum as OSE } from "@ramicktick/common";

import { Order } from "./order.model";

//DAKLE DEFINISSACU DOLE pre HOOK, ZA SLUCAJ "save"
// URADICU TO NA SMAMOM DNU PRE EXPORTA

// ALI PRE TOGA UKIDAMO optimisticConcurrency
// JER TO CE SADA RADITI, POMENUTI HOOK

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
        delete ret.__v;
      },
    },
    // EVO, COMMENT-UJEM OUT OPTIMISTIC CONCURRENCY
    // optimisticConcurrency: true,
    //
    versionKey: "version",
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface TicketFields {
  version: number;
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

// EVO NA OVOM OBJEKTU DEFINISEM METODU

/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface TicketModelI extends Model<TicketDocumentI> {
  // EVO OVO JE TA METODA
  findOneByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDocumentI | null>;
}

/**
 *
 * @param event you can pass allparsedData
 * @returns Promise<TicketDocumentI | null>
 */
ticketSchema.statics.findOneByEvent = async function (event: {
  id: string;
  version: number;
}) {
  const { id, version } = event;

  const ticket = await this.findOne({ _id: id, version: version - 1 });

  return ticket;
};

/**
 *
 * @description method on the document, to check if status is not cancelled, or that order doesn't exist
 * @returns boolean
 */
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

// POSTO JE REC O MIDDLEWARE-U, MORA DA SE KORISTI done CALLBACK POZIV
/**
 * @description OPTIMISTIC CONCURRENCY CONTROL
 */
ticketSchema.pre<TicketDocumentI>("save", function (done) {
  // DAKLE MORAM DA KORISTIM NESTO OVAKO
  this.$where = {
    version: this.get("version") + 1,
  };

  done();
});

/**
 * @description Ticket model
 */
const Ticket = model<TicketDocumentI, TicketModelI>("Ticket", ticketSchema);

export { Ticket };
