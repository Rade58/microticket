# INVALID INPUT TEST; REQUIRING UNIQUE MAIL TEST; A URADICU I TEST KOJI PROVERAVA DA LI CE SE USPESNO SET-OVATI COOKIE

DAKLE TESTIRANJE KORISCENJEMM supertest LIBRARY-JA JE KAKO SI TO MOGAO VIDETI U PREDHODNIM BRNCH-EVIMA VEOMA EASY

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

# SADA CU TESTIRATI, UNIQUENESS LOGIKU VEZANU AN EMAIL

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

# SADA CU DA NAPISEM TEST ZA COOKIE; ODNOSNO PROVERAVAM DA LI SE U FOLLOWUP REQUEST-OVIMA NALAZI SETTED COOKIE

- `code auth/src/routes/__test__/signup.test.ts`

```ts
// ...

it("sets a cookie after successful signup", async () => {
  // PRVO PRVIMO SIGNAUP
  // ODNOSNO TESTIRAMO PRVLJANJE NOVOG USERA, I OCEKUSEMO STATUS CODE 201
  const response = await request(app)
    .post("/api/users/signup")
    .send({
      email: "ian@mail.com",
      password: "JonTheKingzly6",
    })
    .expect(201);

  // ALI KAO STO SI VIDEO CEO GORNJI CALL ETURN-UJE RESPONE
  // TAKO DA GA MOZEMO INSPECT-OVATI DA VIDIMO DA LI JE NA NJEMU COOKIE
  // DAKLE OCEKUJEMO DA "Set-Cookie" HEADER RESPONSE OBJEKTA BUDE DEFINED
  expect(response.get("Set-Cookie")).toBeDefined();
});

```

MEDJUTIM OVAJ TEST CE FAIL-OVATI

BICE RECENO DA Swt-Cookie NIJE DEFINED, DA MI JE VREDNOST undefined ZA OVAJ TEST

# MOJ POSLEDNJI TEST JE FAIL-OVAO ZBOG HTTPS-A

SECAS SE OVOGA:

- `cat `

```ts
// ...
app.set("trust proxy", true);

// ...

app.use(
  cookieSession({
    signed: false,
    // OVOM SI PODESIO DA SE COOKIE MOZE SAMO TRANSFER-OVATI
    // KORISCENJEMM HTTPS PROTOCOL-A
    secure: true,
  })
);
```

**ZATO JE `Set-Cookie` HEADER BIO undefined**
