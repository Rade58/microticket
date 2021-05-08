import { Schema, model, Document, Model } from "mongoose";

// EVO, U SCHEMA-I DEFINISEMO NOVI FIELD orderId
// A POSLE TOGA JOS SAMO U TYPESCRIPT INTERFACE-U
// ZA DOKUMENT, ISTO TYPE-UJEMO POMENUTI FIELD

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    // EVO GA OVDE
    orderId: {
      type: String,
    },
    // --------
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
    optimisticConcurrency: true,
    versionKey: "version",
  }
);

// EVO JOS OVDE DA TYPE-UJEMO orderId
//  I TO JE SVE
// SAM OSTO CU GA TYPE-OVATI KAO OPTIONAL FIELD

/**
 * @description this fields are inputs for the document creation
 */
interface TicketFields {
  version: number;
  title: string;
  price: number;
  userId: string;
  // EVO GA
  orderId?: string;
  // I NISTA VISE NISAM DEFINISAO
}

/**
 * @description interface for things, among others I can search on obtained document
 */
export interface TicketDocumentI extends Document, TicketFields {
  //
}
/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface TicketModelI extends Model<TicketDocumentI> {
  // NECU NISTA DODAVATI, ALI OVDE BI TYPE-OVAO STATICKE METODE KOJE
  // SAMO TI OSTAVLJAM OVO KAO TEMPLATE DEFINISANJA
  __nothing: (input: string) => void; //stavio samo jer moram nesto da dodam, ali ovu metodu necu sigurno definisati
}

// BUILDING METHODS ON DOCUMENT INSTANCES
// ticketSchema.methods.__nothing = async function(){}
// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING NOT GOING TO USE IT )
// ticketSchema.statics.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

/**
 * @description Ticket model
 */
const Ticket = model<TicketDocumentI, TicketModelI>("Ticket", ticketSchema);

export { Ticket };
