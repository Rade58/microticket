# `"PUT"` `/api/tickets/:id` HANDLER FOR UPDATING SINGLE DOCUMENT FROM Tickets COLLECTION

KAO STO VIDIS SLACU I body SA OVIM REQUESTOM, A TAKODJE ROUTE IMA I PARMAETAR

**OPET CU KORISTITI TEST FIRST APPROACH**

AUTOR WORKSHOPA KAZE DA CE OVE TESTOVI, U SLUCAJU "PUT"-A, ODNOSNO PRI UPDATINGU BITI SUPER CRITICAL

***

NE SADA, BUT LATER IN THE PROJECT MI CEMO POCETI DA DODAJEMO OTHER SERVICES, ZA DEALING WITH ORDERS I PAYMENTS I DRUGE STVARI

**POSTOJACE CRITICAL LOGIC AROUND DA LI USER MOZE DA  UPDATE-UJE TICKET**

I TESTOVI CE U TOM SLUCAJU BITI CRITICAL DA IH ODRADIS

***

NEKI MOGUCI ASSERTIONI:

"if id doesn't exist return 404 right away"
"if thers is no user return 401" (POSTO JE ZA OVO ODGOVORAM MIDDLEWARE, ALI MOZES DA TESTIRAS (requireAuth MIDDLEWARE))
"if user doesn't own a ticker (userId OF THE TICKET AND id OF req.currentUser DOESN'T MATCH), return 401"
"if there isn't title OR price field in the body of request, return 400"
"if price field is updated, or if title field is updated, return 201"

DA KRECEM SA DEFINISANJEM TESTA

- `touch tickets/src/routes/__tests__/update.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

const titleCreate = "Stavros is hone";
const priceCreate = 602;

const title = "Nick M is here";
const price = 406;

// CREATE TICKET HELPER
/**
 * @description id OF THE TICKET CAN BE OBTAINED FROM THE .body
 * @description userId OF THE TICKET CAN BE OBTAINED FROM THE .body
 */
const createTicketResponse = async () =>
  request(app)
    .post("api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: titleCreate, price: priceCreate });

// TESTS

it("if id is not provided or it is invalid id, return 400", async () => {
  // INVALID ID HAS LESS THANN 12 CHARACTERS
  // U SAMOM HANDLERU MOES KORISTITI new mongose.Types.ObjectId.toHexCode().length (U USLOVNOJ IZJAVI)
  const invalidId = "isdds26a";

  await request(app)
    .put(`/api/tickets/${invalidId}`)
    .set("Cookie", global.getCookie())
    .send({ title, price })
    .expect(404);
});

it("if the user does not own a ticket, return 404", async () => {
  // MISLIM DA CE MI OVDE TREBATI JOS JEDNA POMOCNA
  // FUNKCIJA, KOJA BI PRAVILA COOKIE, ALI SA RAZLICITIM PODACIMA
  // OD KOJIH IH PRAVI global.getCookie()
  // ALI OVA FUNKCIJA BI KORISTILA PAYLOAD KAO INPUT
  // SVE TO DA BI USPENO DA BI OBAVIO OVAJ TEST

  // JA CU OPET KRIRATI JEST GLOBAL FUNKCIJU

});
```

**NAPRAVICU GLOBAL JEST HELPER-A, O KOJEM SAM GOVORIO**

- `code tickets/src/test/setup.ts`

```ts
// ...



```
