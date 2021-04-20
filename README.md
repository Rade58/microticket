# `Ticket` DOCUMENT CREATION WITH TEST-FIRST APPROACH

DAKLE I OVDE KRECEM OD ASSERTIONA INSIDE TESTS, PRE NEGO STO ACTUALLY IMPLEENTIRAK KREIRANJE DOKUMENTA U HANDLER-U

**ALI AUTOR WORKSHOPA JE ODLUCIO I DA TESTIRA ACTUAL Ticket MODEL, KOJI SMO NAPRAVILI U PROSLOM BRANCH-U**

TAKO DA CU TO I TO JA SADA URADITI

SAMO DA TI OPET PODSETIM DA CE SE KORISTITI MONGO IN MEMORY ATABASE (STO SI PODESIO KROZ HOOKS INSIDE `auth/src/test/setup.ts`)

- `code tickets/src/routes/__tests__/new.test.ts`

```ts
// OSTALE TESTOVE KOJE SAM RANIJE DEFINISAO TI NECU OVDE PRIKAZIVATI, JER NISU RELEVANTNI
// ...

// SADA PISEMO OVAJ TEST
// REKLI SMO DA CEMO PROVERAVATI SAMI MODEL
it("it creates ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});
  // OCEKUJEMO ARRAY
  // A POSTO SE SVE IZ IN MEMORY DATBASE-A BRISE (TAK OSAM PODESIO auth/src/test/setup.ts)
  // BETVEEN TESTS, ASSET-UJEM DA CU IMATI EMPTY ARRAY
  expect(tickets.length).toEqual(0);

  // SADA MOEMO DA PRAVIMO REQUEST
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({
      // BITNO JE STA CES SLATI
      title: "Some event",
      price: 408,
      userId: "assf6sdgdfh4564",
    });

  expect(response.status).toEqual(201);

  // A SADA MOZEMO DA INSPECTUJEMO TICKETS
  // AKO SMO NAPRAVILI TICKET TREBA DA BUDE 1 U Ticket
  // KOLEKCIJI
  tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1);

  // MOZEMO PRAVITI ASSERTIONS I U VEZI FIELD-OVA
  expect(tickets[0].price).toEqual(408);
  expect(tickets[0].title).toEqual("Some event");
});

```

MOZES DA ISPROBAS TEST ALI DEFINITIVNO CE FAIL-OVATI

- `cd tickets`

- `yarn test`

# DA BI TEST PROSAO MI MORAMO DEFINISATI ACTUAL CREATION OF Ticket DOCUMENT, STO CEMO DEFINISATI U HANDLERU



