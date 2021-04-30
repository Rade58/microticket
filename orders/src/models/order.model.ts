import { Schema, model, Document, Model } from "mongoose";

// RESTRUKTURIRAM NEKE TYPE-OVE ZA SCHEMA-U
const { ObjectId, Date: MongooseDate } = Schema.Types;
//

const orderSchema = new Schema({
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
    // NECE BITI REQUIRED, JER OVO NECE POSTOJATI
    // ZA STATUS "paid"
    // JER KAD BUDE PID, TREBALO BI DA BUDE MOGUCE DA SE PODESI DA BUDE null ILI undefined
  },

  // OVDE CE BITI TAJ ref KA DOKUMENTU IZ DRUGE KOLEKCIJE
  // ALI NECU TI JOS TO POKAZIVATI
  // DOK NE NEAPRAVIM SCHEMA-U I MODEL ZA Ticket
  // MOGAO SAM TO ODMAH URADITI ALI NECU
  ticket: {
    type: ObjectId,
    required: true,
  },
});

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
  //  POSTO CE OVO REPREZENTOVTI ASSOCIATION, ONDA
  // CU OVDE KASNIJE PODESITI INTERFACE, KOJI CU UVESTI
  // IZ FILE-A ZA TICKET-OV MODEL
  // ticket: TicketFields;
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
