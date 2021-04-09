# INVALID INPUT TEST; REQUIRING UNIQUE MAIL TEST

DAAKLE TESTIRANJE KORISCENJEMM supertest LIBRARY-JA JE KAKO SI TO MOGAO VIDETI U PREDHODNIM BRNCH-EVIMA VEOMA EASY

# SADA TESTIRAM INVALID INPUTE mail-A I password-A

- `code auth/src/routes/__test__/signup.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("returns 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "stvros@test.com",
      password: "AdamIsCoolBird6",
    })
    .expect(201);
});

// EVO PRAVIM NOVI TEST

it("returns 400 on invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "something",
      password: "AdamIsCoolBird6",
    })
    .expect(400);
});

```

STARTUJ TEST AKO GA NEMAS STARTOVANOG OD RANIJE

- `cd auth` `yarn test`

I OVAJ TESSED JE PROSAO

SLAEDECI TEST JE DA SE OCEKUJE 400 STATUS CODE AKO JE password INVALID

- `code auth/src/routes/__test__/signup.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("returns 201 on successful signup", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "stvros@test.com",
      password: "AdamIsCoolBird6",
    })
    .expect(201);
});

it("returns 400 on invalid email", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "something",
      password: "AdamIsCoolBird6",
    })
    .expect(400);
});

// ZA password

it("returns 400 on invalid password", async () => {
  return request(app)
    .post("/api/users/signup")
    .send({
      email: "stavvy@mail.com",
      password: "me", // INVALID KADA JE MANJE OD 4 I VISE OD 20 KARAKTERA
    })
    .expect(400);
});

```

OPET TI NAPOMINJEM DA TI JE TEST U WATCH MODE-U TAKO DA NE MORAS PONOVO DA GA POKRECES, VEC SAMO DA SAVE-UJES FILE I TEST SE SAM POKRECE (**SEM AKO NE BUDES IMAO CUDNI ERROR ZBOG TYPESCRIPT-A, STO SMO GOVORILI U PROSLOM BRANCH-U (TADA MORAS RESTART-OVATI TEST)**)

I OVAJ TEST JE PROSAO

ODRADICEMO JOS JEDN TEST U SLIUCJU KADA SU INVALID I EMAIL I PASSWORD

# SADA CEMO DA KREIRAMO TEST, UNUTAR KOJEG CEMO DA OBAVIMO NEKOLIKO SEPARATE REQUESTS; KORISTICEMO `await`


- `code auth/src/routes/__test__/signup.test.ts`

```ts
// ...

it("returns 400 on invalid email and password, or when email and password are missing", async () => {
  // EVO OVDE await
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "",
      password: "",
    })
    .expect(400);

  // A OVDE return , ALI TEHNICKI TI NISI MORAO DA RETURN-UJS
  // MOZES KORISTITI I OVDE await
  return request(app)
    .post("/api/users/signup")
    .send({
      // email: "",
      // password: "",
    })
    .expect(400);
});
```

I OVAJ TEST JE PROSAO

# OVO TVOJI TESTOVI SU ZA SADA STVARNO JAKO JEDNOSTAVNI, ALI ONO STO BI TI RADIO JESTE ISCITAVO ONU FUNKCIJU KOJU TESTIRAS, I ONDA NAPISAO TEST ZA INFRASTRUKTURU, ZA NEKU LOGIKU, NEKU USLOVNU IZJAVU KOJ JE U TVOM CODE-U

SADA CU DA URADIM TKAV TEST, A ONO STO CU TESTIRATI JESTE, UNIQUENESS OF AN EMAIL

JER IMAM TAKVU LOGIKU U HANDLERU KOJA NE DOZVOLJAVA EMAIL DUPLICATES

DAKLE OVDE TREBAS DA NAPISES JEDAN REQUEST U TESTU, KOJI CE PROCI, DA BI SE USPESNO KREIRAO KORISNIK U IN MEMORY DATBASE-U, DAKLE TU EXPECT-UJEMO 201

I ONDA CEMO DUPLICIRATI REQUEST (IMACEMO ISTE EMAIL I PASSWORD INPUTE), ALI CEMO TU OCEKIVATI 400, ZATO STO JE U PITANJU ISTI EMAIL

- `code auth/src/routes/__test__/signup.test.ts`

```ts
// ...

it("returns 400 if u try to create user with a existing email", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "nickmullen@comedy.com", password: "Sammich284" })
    .expect(201);

  await request(app)
    .post("/api/users/signup")
    .send({ email: "nickmullen@comedy.com", password: "Sammich284" })
    .expect(400);
});

```

I OVAJ TEST JE PROSAO
