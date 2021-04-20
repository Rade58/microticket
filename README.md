# KREIRANJE `Tickets` MONGOOSE MODEL-A, I JOS MNOGE STVARI

***

ZASTO KAZEM JOS MNOGE STVARI; PA VRATI SE NA [ONDA KADA SI PRAVIO User MODEL](auth/src/models/user.model.ts) I [PROCITAJ OBJASNJENJE (POCEV OD OVOG BRANCHA)](https://github.com/Rade58/microticket/tree/1_2_CREATING_User_MODEL) DA VIDIS STA SAM SVE RADIO

NARAVNO KORISTIO SAM TYPESCRIPT TADA I TO MOZE BITI CHALLENGING

ISTO TAKO NA MODELU SAM OVERRIDE-OVAO [`toJSON`](https://github.com/Rade58/microticket/tree/2_7_FORMATTING_JSON_YOU_SENT_FROM_THE_MICROSERVICE#ja-upravo-mogu-koristiti-override-te-tojson-metode-kako-bi-osigurao-da-kada-se-data-dosla-ma-iz-kojeg-izvora-ma-kojeg-database-a-formatira-kako-bi-bilo-consistant-odnosno-kako-bi-imalo-isti-izgled); I TO POGLEDAJ KAKO SAM URADIO

***

NAJBOLJE JE DAKLE GLEDATI U `auth/src/models/user.model.ts`, DOK KREIRAM `Tickets` MODEL

JER TI CES URADITI SKORO EXACT SAME THING ZA Ticket MODEL

## HAJDE PRVO DA KAZEMO, KOJE CE TO SVE FIELD-OVE IMATI Ticket DOKUMENT U DATBASE-U

EVO POSMATRAJ, OVO SU TI FIELD-OVI
```ts
{
  //  PRV TRI CE BITI REQUIRED PRI BUILDINGU Ticket DOKUMENTA
  title: string;
  price: number;
  userId: string
  // OVO JE ONO STO JE BITNO A STO SAM MONGO PRAVI
  _id: string; // STO JA ZELI MDA OVERRIDE-UJEM DA BUDE id
  //              PRILIKOM VADJENJA IZ DATBASE-A (UZ POMOC 
  //                OVERRIDEN toJSON)
  cretedAt: string; // OVO JE U TIME FORMATU A TO ISTO PRVI 
  //                        DATBASE PRI POHRANJIVANJU 
  //                   OVO MI NECE TREBATI, BAR TAKO MISLIM, 
  //                  SAMO POKAZUJEM DA IMAMO I DODATNE STVARI
  //                    NA DOKUMENTU
}

// BAZ SBOG TIH DODATNIH STVARI JA IMAM DVA INTERFACE-A SA 
// KOJIM TYPE-UJEM MONGOOSE MODEL
```

# KRECEM SA BUILDINGOM `Ticket` MODELA

- `mkdir tickets/src/models`

- `touch tickets/src/models/ticket.model.ts`

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

/**
 * @description this fields are inputs for the document creation
 */
interface TicketFields {
  title: string;
  price: number;
  userId: string;
}

/**
 * @description interface for thing, among others I can search on obtaind document
 */
interface TicketDocumentI extends Document, TicketFields {
  //
}
/**
 * @description interface for additional things on the model
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
