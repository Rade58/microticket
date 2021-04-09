# CHANGING NODE ENVIRONMENT DURING TESTS

SADA CU DA NAPISEM TEST ZA COOKIE; ODNOSNO PROVERAVAM DA LI SE U FOLLOWUP REQUEST-OVIMA NALAZI SETTED COOKIE

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

**ZATO JE `Set-Cookie` HEADER BIO undefined; JER NIJE MOGAO BITI TRANSFERED BES SSL CERTIFICATE-A**
