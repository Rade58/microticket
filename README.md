# TESTS FOR PUBLISHING TO `"order:created"` AND `"order:cancelled"`

RANIJE, U `tickets` MICROSERVICE-U SAM TI POKAZAO KAKO DA MOCK-UJES NESTO

POKAZAO SAM TI KAKO SE KORISTI MOCK FUNCTION [jest.fn](https://github.com/Rade58/microticket/tree/7_4_9_TESTS_FOR_ENSURING_MOCK_INVOCATION#mock-function-jestfn)

NE BI DA TI TO PONOVO OBJASNJAVAM [ZATO PROCITAJ OVO OPET](https://github.com/Rade58/microticket/tree/7_4_9_TESTS_FOR_ENSURING_MOCK_INVOCATION#tests-for-ensuring-mock-invocation)

JA SAM TU LOGIKU KOPIRAO IZ `tickets` MICROSERVICE-A (VIDI: `orders/src/events/__mocks__` I VIDI `orders/src/test/setup.ts`)

ON OSTO SE USTVARI MOCK-UJE JE NATS CLIENT I GLEDAMO DA LI SE IZVRSILA NJEGOVA publish METODA

**A SVE SMO KAO STO REKOH TO MOCK-OVALI I TI PROCITAJ LINKOVE KOJE SAM TI OSTAVIO DA VIDIS KAKO**

JA CU DEFINISATI IMPLEMENTACIJU, I VISE NECU NISTA KOMENTARISATI

- `code `

```ts
// NECU DA POKAUJEM SAV CODE OD RANIJE VEC ONO SAM OSTO JE
// RELEVANTNO ZA TRNUTNI TEST

// ...

// KAO STO ZNAS OVDE CE BITI SERVIRN MOCK, UMESTO PRAVE
// STVARI, IAKO UVOZ IZGLEDA DA JE ZA VALID STVAR
import { natsWrapper } from "../../events/nats-wrapper";
//


// ...
// ...

// PISEMO TEST


it("publishes event to order:created channel", async () => {
  const ticket = await Ticket.create({
    title: "tool band",
    price: 69,
  });

  const ticketId = ticket.id;
  const cookie = global.getCookie();
  
  await request(app)
    .post("/api/orders")
    .set("Cookie", cookie)
    .send({
      ticketId,
    })
    .expect(201);

  // DAKLE TREBAO JE DA SE PUBLJISH-UJE EVENT, TOKOM IZVRSAVANJA GORNJEG
  // HANDLERA, A TO PROVERAVAMO OVAKO
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});


```

# ISTO RADIMO I ZA SLUCAJ PUBLISHING-A `"order:cancelled"`

- `code orders/src/routes/__test__/delete.test.ts`

```ts
// ...
// ...

import { natsWrapper } from "../../events/nats-wrapper";

// ...
// ...


it("publishes order:cancelled event", async () => {
  const cookie = global.getCookie();

  const ticketIds = await createTickets(8);

  const orderIds = await createOrders(ticketIds, 6, cookie);

  await request(app)
    .patch(`/api/orders/${orderIds[0]}`)
    .set("Cookie", cookie)
    .send();

  // ------------

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
```

## POKRENUCEMO TESTS SUITE

- `cd orders`

- `yarn test`
