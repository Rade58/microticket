# MALO REDEFINISANJE NEKIH STVARI VEZANIH ZA Ticket MODEL U orders MICROSERVICE-U

MORAM DA RAZMISLAJM O TOME DA MENI, NA DOKUMENTIMA U Tickets KOLEKCIJI, NE TREBAJU NEKE STVARI

NA PRIMER NE TREBA MI userId

**ONO STO BI M ITREBAL OJE `version` FIELD** (ALI O TOME JOS NECEMO GOVORITI I NISTA NECEMO DEFINISATI, DOK SE POSEBNO NE POZABAVIMO CONCURRENCY ISSUE-OVIMA)

JOS CU NEKE STVARI REDEFINISATI, ALI CU TI TO PREDSTAVITI SA KOMANTARIMA

- `code orders/src/models/ticket.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";

const ticketSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      // AUTOR WORKSHOPA JE OVDE ODLUCIO DA ZADA VALIDACIJU
      // DA NE SME BITI ISPOD NULE
      min: 0,
      // A MISSLI MDA JE TO ZABORAVIO DA URADI U tickets MICROSERVICE-U
    },
    // OVO DAKLE OVDE NE TREBA
    /* userId: {
      type: String,
      required: true,
    }, */
  },
  {
    toJSON: {
      /**
       * @param ret object to be returned later as json
       */
      transform(doc, ret, options) {
        ret.id = ret._id;

        delete ret._id;

        // NECEMO DELETOVATI ret.__v
        // delete ret.__v;
        // JA MISLI MDA TI VEC NASLUCUJES DA JE TO JER CE
        // __v UCESTVOVATI U RESAVANJU CONCURRENCY PROBLEMA
        // STO CU TI POKAZATI KADA ZA TO DODJE VREME
      },
    },
  }
);

// OVO I DALJE EXPORT-UJEM I TO NECEMO NISTA MANJATI (JER GA KORISTIMO U FILE-U ZA Order)
// I DALJE VISE NISTA NECU RADITI IU OVOM FILE-U
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

// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING NOT GOING TO USE IT )
// ticketSchema.statics.__nothing = async function (input) {/**/};
// pre HOOK
// ticketSchema.pre("save", async function (next) {/**/});

/**
 * @description Ticket model
 */
const Ticket = model<TicketDocumentI, TicketModelI>("Ticket", ticketSchema);

export { Ticket };

```

