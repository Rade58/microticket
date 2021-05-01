# CREATING `status` ENUM

DAKLE JA ZELIM DA DEFINISEM ENUM KOJI CE OPISIVATI status ORDER-A 

# THE NEED FOR AN ENUM

PRVO CU DA POGLEDAM ZASTO IMAM POTREBU ZA OVAKAVIM ENUMOM

KADA ordrs MICROSERVICE BUDE PUBLISH-OVAO EVENT "`order:created`", TO CE EVENTUALY STICI DO `payments` MICROSERVICE-A, KOJEG CU NESTO KASNIJE NAPRAVITI

**A TADA CE OREDER BITI U STATUSU "pending"-A, TO CE STAJATI I U DATA-I, KOJA JE SA POMENUTIM EVENTOM STIGLA U `payments` MICROSERVICE**

DALJE CE SE MOGU DESAVATI RAZNE STVARI A KOJE SE TICU KOMUNIKACIJE SA `payments` MICROSERVICE-OM

USER MOZE POGRESITI PRI UNOSU POFDATKA KREDITNE KARTICE, I TADA BI `status` ORDERA BIO `"failed"`, STO BI SE MORALO KOMUNICIRATI NAZAD DO `orders` MICROSERVICE-A, SLANJEM `"order:failed"` EVENT-A

**DALJE IMA DOSTA PROSTORA ZA GRESKU**

DALJE DAKLE POSTO BI BIO SUBSCRIBED NA `"order:failed"` KANAL, `orders` MICROSERVICE BI MORAO PODESTI, TAKAV ORDER U SVOM MICROSERVICE-U DA IMA NOVI STATUS

**E TU SE MOZE POGRESITI AKO SE KORISTI HARDCODED EVENT, USTVARI MOZE SE MISSREMEBER-OVTI ILI MISSTYPE-OVATI**

NA PRIMER Order DOKUMENT SE MOZE POGRESNO UPDATE-OVATI, I NA PRIMER ZADATI MU `status` DA NE BUDE `failed`, VE NA PRIMET `"no_payment"` 

***

POSTO CE I `orders` I `expiration` I `payments` MICROSERVICE-OVI KORISTITI LOGIKU KOJA SE TICE status-A EVENT-A, NAJBOLJE BI BILO **DA DEFINSEM EXACT DEFINITION, O TOME KAKVE SVE RAZLICITE status VREDNOSTI, Order MOZE IMATI**

***

DAKL OVIM SE BRANIM OD ACCIDENTLY TYPOS-A

# ENUM CU DEFINISATI U MOM `"@ramicktick/common"` LIBRARY-JU 

**POSTO CE I DRUGI MICROSRVICE-I KORISTITI status FIELD NA Order DOKUMENTU, BOLJE JE DA TAJ ENUM BUDE DEO `"@ramicktick/common"` LIBRARY-JA**

- `mkdir common/src/events/types`

- `touch common/src/events/types/order-status-enum.ts`

DEFINISACU 4 RAZLICITE VREDNOSTI U ENUMU, A DODACU I KOMENTARE KOJI CE OPISIVATI, NJIHOVU NAMENU

***

**MALO CE MI BITI CUDNE VREDNOSTI OVOG ENUMA, POGOTOOVO STO TO NISU ONE VREDNOSTI, KOJE SAM POMINJAO, ALI TAKODJE I IMACE MALO CUDAN OBLIK**

***

```ts
export enum OrderStatusEnum {
  /**
   * @description when the order has been created, but ticket
   * trying to be ordered, is not reserved
   */
  created = "created",
  /**
   * @description ticket, that is being tried to be reserved, has already
   * been reserved, or user cancelled the order,
   * or payment info was wrong
   * or order expired before payment
   */
  cancelld = "cancelled",
  /**
   * @description ticket is successfully reserved
   */
  awaiting_payment = "awaiting:payment",

  /**
   * @description user has provided payment info successfully
   */
  complete = "complete",
}

```

**OVAKVE SU VREDNOSTI, JER MORACEMO DA RAZMISLJAMO O RACE CONDITIONSIMA VERY DEEPLY**

ZATO IMAMO created; MI CEMO MISLITI DA SMO NAPRAVILI ORDER PREMA TICKETU, ALI NE ZNAMO FOR SURE

**TU POSTOJI PITANJE IZMDJU DVE STVARI, AVAILABILITY TICKETA, I RESERVATION, JER NESTO MOZE JEDINO BITI RESERVED, AKO JE AVAILABLE** (MOZZDA C MI OBVO BITI JASNIJE KADA BUDEM GLEDAO IMPLEMENTACIJU SVEGA)

`cancelled` PRESDSTAVLJA NEKI CATCH ALL, KAO DA CAPTURE-UJE NEKLIKO DIFFERENT CASES OF FAILIURE (**MOGLI SMO TO SEPARET-EOVATI U NEKOLIKO DIFFERENT STATUS-A, ALI NECEMO TO URADITI, MEDJUTIM ZBOG NALAITIKE, O TOME ZASTO ORDER FAIL-UJE TO BE PROCESSED BILO BI DOBRO, ALI NAMA JE cancelled SASVIM DOVOLJNO**)

# DA SADA IZVEZEMO, NAS `OrderStatusEnum`, IZ NASEG PACKAGE-A

- `code `

```ts
export * from "./errors/bad-request-error";
export * from "./errors/custom-error";
export * from "./errors/database-connection-error";
export * from "./errors/not-authorized-error";
export * from "./errors/not-found-error";
export * from "./errors/request-validation-error";
export * from "./middlewares/current-user";
export * from "./middlewares/error-handler";
export * from "./middlewares/require-auth";
export * from "./middlewares/validate-request";

export * from "./events/abstr/abstr-listener";
export * from "./events/abstr/abstr-publisher";
export * from "./events/channel-names";
export * from "./events/event-interfaces/ticket-created-event";
export * from "./events/event-interfaces/ticket-updated-event";

// DODAO OVO
export * from "./events/types/order-status-enum";

```

# SADA CEMO A REPUBLISH-UJEMO MODUL

- `cd common`

- `npm run pub`

# SADA CEMO DA INSTALIRAMO (UPDATE-UJEMO),NAS MODUL, PONOVO U NASEM `orders` MICROSERVICE-U

- `cd orders`

- `yarn add @ramicktick/common --latest`

