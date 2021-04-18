# UPDATING common MODULE

***
***

digresija:

TEBI JE TRENUTNO REPO TVOG PACKAGE-A `@ramicktick/common`, SMESTEN U FOLDERU `/common`; NARAVNO KADA BI PRAVIO LIBRARY TI BI SIGURNO IMAO NEKI ODVOJEN FOLDER NEGDE DRUGDE ZA TVOJ LIBRARY

ALI SAMO ZBOG CONVINIENCA I ZATO STO SAM PREMESTAO DOSTA CODE-A, POMENUTI LIBRARY JESTE U NASEM PROJEKTU, I ON JE NESTED REPO

SAMO TI OVO NAPOMINJEM AKO NAKNADNO DODJES OVDE DA VIDIS OVAJ CEO PROJEKAT I POGUBIS SE; **E PA LIBRARY JE POTPUNO AUTONAOMNA STVAR** (JA NE PRAVIM MICROSERVICE OD ONOGA U common FOLDERU)

***
***

DAKLE ZELIM DA TI POKAZEM KAKO ESYLY MOZEMO DA NAPRAVIMO CHANGE NA NECEMU U NASEM common MODULE-U; I DA REFLECT-UJEMO TE CHANGES U NASEM auth MICROSERVICE-U

**NE MORAS DA ZAUSTAVLJAS SKAFFOLD AKO TI JE UPALJEN (TACNIJE UPPALI GA)**

## SADA MENJAM NESTO U MOM PAKETU; NA PRIMER EXPORT-UJ NEKI SIMPLE STRING

- `code common/src/index.ts`

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

// EVO EXPORTOVAO SAM OVO
export const color = "crimson"

```

## ONDA POKRECEM ONAJ AUTOMATED PUBLISHING SCRIPT

OPET TI NAPOMINJEM DA SE OVAJ SCRIPT NE KORISTI U REAL WORL PROJEKTIMA

AKO I SAM POGLEDAS SCRIPT VIDIS DA ON IMA GENERIC COMMIT MESSAGE STO JE LOSE

***

OPET TI NAPOMINJEM DA CE OVAJ SCRIPT TRANSPILE-OVATI TYPESCRIPT; I ONDA CE TRANSPILED JAVASCRIPT BITI PUBLISHED TO NPM; ALI ZAJEDNO SA TYPESCRIPT TYPE DFINITIONSIMA

STO SE TICE GITA, ONAJ TRANSPILED JAVASCRIPT I TYPE DEFINITIONS NECE BITI GIT COMMITED

***

- `cd common`

- `npm run pub` (NEMOJ SA YARNOM JER MI DOLAZI NPM AUTHORIZATION ERROR)

DAKLE REPUBLISH-OVAO SI SVOJ `"@ramicktick/common"` PACKAGE TO NPM

ISTO TAKO VERZIJA PAKETA JE DOBILA INCREMENTED BROJ, STO CES NARAVNO ODMAH VIDETI

## POSTO JE PAKET PUBLISHED, MOZES SADA DA U MICROSERVICU, KOJI GA KORISTI, UPRAVO UPDATE-UJES POMENUTI PAKET, JER SAM GA TAMO INSTALIRAO RANIJE

- `cd auth`

- `yarn add @ramicktick/common --latest` (INSTALIRAM SA YARNOM, JER VEC IMAM yarn.lock FILE, NECU DA GENERISEM I paclage.lock.json)

PROVERI PRVO DA LI SADA IMAS NOVU VERZIJU PAKETA

- `cat auth/package.json`

IMAM ZAISTA NOVU VERZIJU @ramicktick/common PAKETA

***

digresija:

NEMOJ DA KORISTIS NI JEDNU updade ILI upgrade KOMANDU NPM-A ILI YARNA JER NE RADE; KORISTI npm install ILI yarn add

***

## INSTALIRANJE MOG PAKTA JE IZAZVALO REBUILDING IMAGE-A; I SADA KADA SE TO ZAVRSI TREBALO BI DA BUDES U MOGUCNOSTI DA KORISTIS ONO IZ NASEG PAKETA, STO SI NEDAVNO DODAO

- `code auth/src/index.ts`

```ts
//...

// ZAISTA OVA STVAR JE TU PRISUTNA JER TU JE I TYPE DEFINITION
// MOGAO SAMM DA UVEZEM I DA STMAPAM
import { color } from "@ramicktick/common";
console.log({ color });
//
```

I SADA CE SE DESITI SYNC, ODNOSNO OVAJ FAILE JE SYNCED U CLUSTERU, CHANGES CE SE ODMAH DESITI I MOCI CES U TERMINALU SKAFFOLD-A DA VIIDIS STMAPAN TEKST

```zsh
[auth] { color: 'crimson' }
```

# TI NISI NARAVNO MORAO DA PROVERAVAS NA POMENUTI NACIN, MOGAO SI USKOCITI U POD auth-A, ODNOSNO U CONTAINER, ODNOSNO MOGAO SI TAMO OTVORITI SHELL, KORISCENJEM `kubectl` KOMANDE

- `cd auth`

OTVARAM NOVI TERMINAL I KUCAM

- `kubectl list pods`

```sh
NAME                               READY   STATUS    RESTARTS   AGE
auth-depl-6ccbcff6d4-7f9p2         1/1     Running   0          17m
auth-mongo-depl-6575689d86-hhpvk   1/1     Running   0          37m
client-depl-5c7dc9c7b-kzzqb        1/1     Running   0          37m
```

- `kubectl exec -it auth-depl-6ccbcff6d4-7f9p2 sh`

**SAD SI U SHELL-U CONTAINERA**

MOZES DA TRAZIS VERZIJE INSPECT-UJUCI `package.json` FILE-OVE

- `ls node_modules/@ramicktick/common`

KAO STO VIDIS TU JE I ONAJ `build` FOLDER; NJEGA SMO JEDINOG PUBLISH-OVALI NA NPM (U NJEMU JE DAKLE TRANSPILED JAVASCRIPT SA TYPESCRIPT TYPE DEFINITIONSIMA)

```zsh
build         package.json
```

- `ls node_modules/@ramicktick/common/build`

```zsh
errors       index.d.ts   index.js     middlewares
```

- `ls node_modules/@ramicktick/common/build/middlewares`

```zsh
current-user.d.ts      current-user.js        error-handler.d.ts     error-handler.js       require-auth.d.ts      require-auth.js        validate-request.d.ts  validate-request.js
```

STAMPACU package.json AMOG INSTALIRANOG PAKETA

- `cat node_modules/@ramicktick/common/package.json`

```js
//...
// EVO NESTO STO IZ TOG FILE-A 
"_from": "@ramicktick/common@^1.0.4",
"_id": "@ramicktick/common@1.0.4",
```

A MOGU I U CODEBASE-U, TRANSPILED JAVASCRIPT-A, DA NADJEM IZMENU KOJU SAM DEFINISAO, PRE REPUBLISHING-A

- `cat ls node_modules/@ramicktick/common/build/index.js`

```js
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.color = void 0;
__exportStar(require("./errors/bad-request-error"), exports);
__exportStar(require("./errors/custom-error"), exports);
__exportStar(require("./errors/database-connection-error"), exports);
__exportStar(require("./errors/not-authorized-error"), exports);
__exportStar(require("./errors/not-found-error"), exports);
__exportStar(require("./errors/request-validation-error"), exports);
__exportStar(require("./middlewares/current-user"), exports);
__exportStar(require("./middlewares/error-handler"), exports);
__exportStar(require("./middlewares/require-auth"), exports);
__exportStar(require("./middlewares/validate-request"), exports);

exports.color = "crimson"; // OVO JE ONO STA SAM DODAO 

```

MOZES SA exit SADA DA IZADJES IS CONTAINER SHELL-A
