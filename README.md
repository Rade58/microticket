# `tickets` MICROSERVICE SETUP

- `mkdir -p tickets/src`

REKAO SAM U PROSLOM BRANCHU DA CU NEKE FILE-OVE KOPIRATI IZ `auth` MICROSERVICE-A

**KOPIRAM `package.json`, `Dockerfile`, `.dockerignore` I `auth/src/index.ts`**

**AUTOR WORKSHOPA JE TAKODJE ODLUCIO DA KOPIRAI package.lock.json I tsconfig.json, ALI I `/src/app.ts` I `auth/src/test` FOLDER, U KOJEM JE ONA JSETUP ZA TESTS**

**JA CU KOPIRATI `auth/yarn.lock`(JER IMAM TJ FILE) I KOPIRACU `auth/tsconfig.json`, `auth/src/app.ts` I `auth/src/test` **

SAD SVE TE FILE-OVE I FOLDERE IMAM U MOM `tickets` FOLDERU

# SADA DA U FAJLOVIM KOJE SAM KOPIRAO DA ZAMENIM REFERENCE NA `auth`

NARAVNO TO JE `package.json`

- `code tickets/package.json`

TU MENJS `"name"` FIELD; UMESTO "auth" STAVLJAS "tickets" VREDNOST

**STO SE TICE KONEKTOVANJA NA DATABESE, U index.ts FILE-U, IMAS ONAJ URL, KOJI JE USTVARI URL DATBASE ZA USERS**

UKLONI TO DOOK NE NAPRAVIS DEPLOYMENT ZA ANOTHER DATBASE

- `code tickets/src/index.ts`

```ts
// ...
await mongoose.connect(/* "mongodb://auth-mongo-srv:27017/auth" */, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
```

**U APP FILE-U USE-UJES DOSTA ROUTERA, KOJI NISU RELEVANTNI I NECU IH KOTRISTITI, I TO TREBAS UKLONITI**

- `code tickets/src/app.ts`

```ts

// ...

/* import { currentUserRouter } from "./routes/current-user";
import { signInRouter } from "./routes/signin";
import { signOutRouter } from "./routes/signout";
import { signUpRouter } from "./routes/signup"; */

// ...

/* app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter); */

```

## INSTALIRACU SADA DEPENDANCIES

MADA NIJE MI JASNO ZASTO, JER CE CLUSTER NA GOOGLE CLOUD-U BITI ODGOVORAN ZA TO

JEDINO STO BI TO URADIO JESTE AKO BI PISAO TESTS ZA OVAJ MICROSERVICE, U BUDUCNOSTI A VEROVATNO HOCU

- `cd tickets`

- `yarn`

POTRAJACE DUGO ZBO "MONGODB-JA IN MEMORY" PAKETA, I SAM ODA TE PODSETI MDA JE ON DEV DEPENDANCI I NECE BITI DEO DOCKER IMAGE-A (JER SI OBEZBEDIO U Dockerfile-U `--only=prod` FLAG)

# SADA JA NECU BUILD-OVATI DOCKER IMAGE I NECU GA PUSH-OVATI TO DOCKER HUB

TO BI TI RADIO DA TI CLUSTER NIJE HOSTED NA DOCKER HUB-U, VEC NA LOKALNOJ MACHINEI; SAMO DA TE PODSETI MDA BI TI TADA KUCAO, U MICROSERVICE-OVOM FOLDERU `docker build image -t <tvoje ime, odnosno id na docker hubu>/<ime image-a> .`, A ZA PUSHING TO DOCKER HUB KUCAO BI `docker push <tvoje ime, odnosno id na docker hubu>/<ime image-a>` (**A OVAJ KORAK SE RADI ZBOG SKAFFOLD-A, KOJI PRVO RECH-UJE DO DOCKERHUB-A ZA IMAGE**)

ALI KAO STO REKOH, NECU TO RADITI

