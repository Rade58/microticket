# POVEZIVANJE ORDERA SA CHARGE-OM

JA NISAM JOS ZAVRSIO SA DEFINICIJOM MOG HANDLER-A ZA CREATING CHARGE

JOS RANIJE, REKAO SAM DA CU U DATBASE-U TIED TO `payments` IMATI PRIMARNU KOLEKCIJU; A REPLICATED KOLEKCIJA JE `Orders`

ZA Orders SAM NAPRAVIO MODEL I KORISTIO SAM GA DA BI NA `"order:create"` I `"order:cancelled"`, KREIRAO/UPDATE-OVAO REPLICATED ORDER

I ZATO IMAMO GAP I U NASEM HANDLERU ZA KREIRANJE CHARGE-A

MI JESMO KREIRALI CHARGE, VEZANO ZA STRIPE, ALI NISMO ODREDJENI DATA CHARGE-A STORE-OVALI U DATBASE, TACNIJE NAS CHARGE NEMA NA SEBI NIKAKV DATA KOJI GA POVEZUJE, SA ODREDJENIM ORDEROM

**MI NEMAMO DEFINISAN MODEL KOJI BI TAKAV DATA STORE-OVAO U NEKOM DOKUMENTU U DATBASE-U (MISLIM NA OBJEKAT KOJI BI IMAO DATA, KOJI POVEZUJE ORDER SA NEKI MCHARGE-OM)**

**MI CEMO USTVARI DEFINISATI `Payments` MODEL**

TAKAV MODEL CE NAM TREBATI JER ZELIMO DA IMAMO U DATBASE-U INFO, KADA JE NECIJI CREDIT CARD BIO BILLED I INFORMACIJE TOG BILLING-A; ALI I SA KOJIM JE ORDEROM POVEZAN TAJ BILLING

**DATA POMENUTE KOLEKCIJE JA NECU KORISTITI NIGDE U MOM APP-U; NECEMMO CITATI IZ NJE, NECEMO SHOW-OVATI ANY INFORMATION FROM IT**

ALI MOZE BITI FUTURE PROOFING, ODNOSNO MOZDA TI MOZE POSLUZITI U BUDUCNOSTI, AKO IKAD BUDES IMAO DASHBOARD ZA SVOJE USER-E, DA ONI VIDE KAOJE SU PAYMENTS OBAVILI U TVOJ WEB APLIKACIJI, I ZA KOJE ORDER-E

# PRAVIMO `Payment` MODEL

- `touch payments/src/models/payment.model.ts`

```ts
import { Schema, model, Document, Model } from "mongoose";
import { OrderDocumentI } from "./order.model";

const { ObjectId } = Schema.Types;

const paymentSchema = new Schema(
  {
    order: {
      // OVO NIJE MORAO DA BUDE REF ,ALI JA SAM GA IPAK DEFINISAO
      type: ObjectId,
      ref: "Order",
      required: true,
    },
    stripeChargeId: {
      type: String,
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
    // POSTO SE CHARING ZA NEKI ORDER OBAVLJA SAMO JEDNOM
    // MI NIKADA NECEMO UPDATE-OVATI Payment DOKUMENT
    // ZATO OVO NIJE POTREBNO
    /* optimisticConcurrency: true,
    versionKey: "version",
    */
  }
);

/**
 * @description this fields are inputs for the document creation
 */
interface PaymentFields {
  stripeChargeId: string;
  order: OrderDocumentI;
  // OVO NECE POSTOJATI DAKLE
  // version: number;
}

/**
 * @description interface for things, among others, I can search on obtained document
 */
export interface PaymentDocumentI extends Document, PaymentFields {
  //
}

/**
 * @description interface for additional things on the model (MOSTLY METHODS TO BE USED ON THE MODEL)
 */
interface PaymentModelI extends Model<PaymentDocumentI> {
  __nothing: () => void;
}

// BUILDING STATIC METHODS ON MODEL ( JUST SHOVING NOT GOING TO USE IT )
// paymentSchema.statics.__nothing = async function (input) {/**/};
// pre HOOK
// paymentSchema.pre("save", async function (next) {/**/});
// METHODS ON DOCUMENT
// paymentSchema.methods.

const Payment = model<PaymentDocumentI, PaymentModelI>(
  "Payment",
  paymentSchema
);

export { Payment };

```

ALI DOBRA JE PRAKSA INCLUDE-OVATI VERSIO NZA ANY RECORD I KORISTITI OPTIMISTIC CONCURRENCY, CAK I KADA MISLIS DA SE DOKUMENT NIKADA NECE UPDATE-OVATI

ALI NEMA VEZE, JA TO OVDE NECU URADITI; **JER ZASIGURNO ZNAM DA NIKAD NECEMO MENJATI DOKUMENTE IZ `Payments` KOLEKCIJE**
