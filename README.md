# LISTENERS INSIDE `tickets` MICROSERVICE

NAIME POTREBNO JE DEFINISATI I LISTENERS INSIDE `tickets` MICROSERVICE

ONI BI BILI ZA KANALE `"order:created"` I `"order:cancelled"`

A ZASTO?

**PA DA MI NEJEKO PODESILI ADDITIONAL FIELD NA TICKETU, KOJI CE OZNACITI DA Ticket DOKUMENT NE MOZE BITI EDITED OD STRANE KORISNIKA KOJI GA JE NAPRAVIO; U SLUCAJ UDA JE ORDER VEC KREIRAN ZA POMENUTI TICKET**

A KADA KORISNIK KOJI JE NAPRAVIO ORDER CACELL-UJE ISTI, TADA NA TICKETU TREBA OZNACITI DA JE DOZVOLJEN NJEGOV EDDITING, ODNONO UPDATING

# PRVO STA CU URADITI JESTE DEFINISATI DA Ticket DOKUMENT, MOZE IMATI I `orderId` FIELD, KOJI CCE BITI OPCION, ODNONO KADA SE TICKET KREIRA, ON NE MORA POSTOJATI, A ZASIGURNO NECE NI POSTOJATI, JER KADA SE TICKET KREIRA, JASNO JE DA NE POSTOJI ORDER ZA NJEGA JER GA NIKO JOS NIJE NAPRAVIO 

NAIME, KADA JE OVAJ FIELD DEFINISAN TO CE ZNACITI DA JE TICKET RESEVED, ODNOSN ODA ZA NJEG POSTOJI ORDER

A KADA SE ORDER CACELL-UJE, TREBALO BI DA SE OVOM FIELD-U DODELI `null` NA PRIMER

- `code tickets/src/models/ticket.model.ts`

```ts
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

**ISTO TAKO, POSTO POMENUTI FIELD NIJE REQUIRED, NE MORAMO DA REDEFINISEMO CODE U RAOUTE HANDLERIMA, KONKRETNO PRI CREATINGU NEW TICKET-A, JER SE TAJ FIELD TADA NE KORISTI, A NEMAM NI SLUCAJ U DRUGIM HANDLERIMA DA SE UPDATE-UJE, POMENUTI FIELD**
