# KREIRANJE `"GET"` `/api/tickets/:id`

DAKLE KREIRAM ROUTER ZA GETTING SINLE TICKET DOKUMENT-A

**NARAVNO I OVDE KORISTIM TEST-FIRST APPROACH**

TAKO DA KRECEM OD TEST FILE-A

- `touch tickets/src/routes/__tests__/show.test.ts`

```ts
import request from "supertest";
import { app } from "../../app";

it("returns 404 if the ticket is not found", async () => {
  const someRandomId = "sfsdgdgd3534534";

  const response = await request(app)
    .get(`/api/tickets/${someRandomId}`)
    .set("Cookie", global.getCookie())
    .send()

    // MOZE I OVAKO
    // expect(response.status).toEqual(404);
    // ALI MOZE I CHAINING
    .expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  // OVDE SE PRVO MORA KREIRATI TICKET

  const price = 206;
  const title = "Stavros going";

  const response1 = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({
      title,
      price,
    })
    .expect(201);

  const { id } = response1.body;

  const response2 = await request(app)
    .get(`/api/tickets/${id}`)
    .set("Cookie", global.getCookie())
    .send();

  expect(response2.status).toEqual(200); // I OVO SI MOGAO DA CHAIN-UJES ALI NEMA VEZE

  expect(response2.body.title).toEqual(title);
  expect(response2.body.price).toEqual(price);
});
```

NE MORAS JOS DA TESTIRAS, DOK NE IMPLEMENTIRAS SAMI HANDLER

## KREIRAM HANDLER, ZA KOJI SAM PISAO GORNJE TESTOVE

- `touch tickets/src/routes/show.ts`

```ts

```
