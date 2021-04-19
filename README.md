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

```
