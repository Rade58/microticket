# ASSOCIATING Orders AND Tickets

***

digresija:

**MOZDA TI JE OVO SADA RANDOM INFORMACIJA, I NERLEVNTNA ZA TRENUTNU TEMU, `ALI OPET TE PODSECAM`, IDEJA DA KADA SE Ticket DOKUMENT KREIRA U `tickets` MICROSERVICE-U, EVENT CE BITI ISSUED, KOJI CE EVENTULLY STICI DO `orders` MICROSERVICE-A, I TAKO CE I U `orders` MICROSERVICE-U, ISTO TAKO STORE-OVATI DATA Ticket DOKUMENTA, ALI U DATBASE-U KOJI JE RELATED TO orders MICROSERVICE**

**A KADA KORISNIK BUDE PRAVIO ORDER, ONDA CE DATBASE, (RELATED TO ordrs MICROSERVICE) DOBITI Order DOKUMENT**

DAKLE DTABASE KOJI JE TIED TO orders CE IMATI DV KOLEKCIJE: Tickets I Orders

**A ONO STO ORDER IMA RELATED ticketId**

A QUERYING BI MI BIO OLAKSAN KADA BI TAJ ticketId BIO REFERENCA

***

ASSOCIATION JE MONGODB STVAR, [O KOJOJ SAM I OVDE GOVORIO](https://github.com/Rade58/apis_trying_out_and_practicing/tree/master/Node.js/2.%20MongoDB/c)%20ASSOCIATIONS)

OVDE TI GOVORIM O TOME DA JEDAN FIELD NA Orders DOKUMMENTU BUDE USTVARI REFERENCA ZA ODREDJENI Ticket DOKUMENT

TIME SAM SE VEC JEDNOM BAVIO

`ticketId` FIELD NA Orders DOKUMENTU TREBA DA BUDE TREFERENCA

## ZA TO MORAMO KORISTITI NESTED SCHEMAS

MI I NISMO DO SADA NI POCELI SA KREIRANJEM MONGOOSE MODELA ZA orders MICROSERVICE

TO CEMO SADA ODRADITI, A UZ TO CEMO DEFINISATI I NESTED SCHEMAS

### A PRI QUERYINGU REFERENCA SE MOZE QUERYOVATI, KORISCENJEM populate METODE

SAMO TI TO NAPOMINJEM, AKO SI ZABORAVIO

# PRE NEGO STO TI POKAZEM TU ASSOTIATION STVAR, KREIRAMO Order MODEL I KREIRAMO Ticket MODEL

- `mkdir orders/src/models`

- `touch orders/src/models/{order.model,ticket.model}.ts`

- `code orders/src/models/order.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";

// RESTRUKTURIRAM NEKE TYPE-OVE ZA SCHEMA-U
const { ObjectId, Date: MongooseDate } = Schema.Types;
//

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
        // __v   NECEMO DELET-OVATI
        // PREDPOSTAVLJAM ZBOG CONCURRENCY STVARI
        // KOJE CU DA IMPLEMENTIRAM KORISCENJEM __v
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

```

**DA DEFINISEM I SCHEMA-UI MODEL ZA Tickets COLLECTION**

JA USTVARI MOGU DA PREKOPIRAM SVE TO IZ tickets MICROSERVICE-A

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
    },
    userId: {
      type: String,
      required: true,
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
  }
);

// SAMO STO SADA EXPORT-UJEMO OVAJ INTERFACE
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

# MOGU SADA DA DEFINISEM U SCHEME ZA Order, DA JE `ticket` FIELD, USTVARI `'ref'` ZA `"Ticket"`

DAKLE SAMO MODIFIKUJEM PAR STVARI

- `code orders/src/models/order.model.ts`

```ts
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
```

