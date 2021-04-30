import { Schema, model, Document, Model } from "mongoose";
// UVOZIM OVO
import { TicketFields } from "./ticket.model";
//

// ONO STO CEMO DODATI JESTE      ref    ZA    ticket    FIELD
//
// I PROSIRICEMO TYPESCRIPT DEFINICIJU, KKO BISMO TYPE-OVALI
// ticket FIELD, JER KADA SE UPOTREBI populate, NAKON QUERYINGA
// MOCI CES DA LAKO VIDIS TE FIEL-OVE

const { ObjectId, Date: MongooseDate } = Schema.Types;

const orderSchema = new Schema(
  {
    userId: {
      type: ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "expired", "paid"],
      required: true,
    },
    expiresAt: {
      type: MongooseDate,
    },
    ticket: {
      type: ObjectId,
      // OVO DEFINISEM DA JE REFERENCA ZA Ticket DOCUMENT
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

enum StatusEnum {
  pending = "pending",
  expired = "expired",
  paid = "paid",
}

/**
 * @description this fields are inputs for the document creation
 */
interface OrderFields {
  userId: string;
  status: StatusEnum;
  expiresAt: string;
  // ---- EVO DEFINISEM OVO ----
  ticket: TicketFields;
  // ---------------------------
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
