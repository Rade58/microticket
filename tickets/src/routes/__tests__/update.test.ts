import request from "supertest";
import { app } from "../../app";

import { Types } from "mongoose";

const titleCreate = "Stavros ey";
const priceCreate = 602;

const title = "Nick hola";
const price = 406;

/**
 * @description id OF THE TICKET CAN BE OBTAINED FROM THE .body
 * @description userId OF THE TICKET CAN BE OBTAINED FROM THE .body
 */
const createTicketResponse = async () =>
  request(app)
    .post("/api/tickets")
    .set("Cookie", global.getCookie())
    .send({ title: titleCreate, price: priceCreate });

it("if ticket with that id doesn't exist, return 400", async () => {
  const randomId = new Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${randomId}`)
    .set("Cookie", global.getCookie())
    .send({ title, price })
    .expect(404);
});

// DODACI U TEST KOJI PROVERAVA SAMO DA LI POSTOJI KORISNIK
it("if there is no authenticated user, it returns 401", async () => {
  const response = await createTicketResponse();

  const { id } = response.body;

  // SLACU REQUEST BEZ COOKIE-A I OCEKUJEM 401

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title, price })
    .expect(401);
});

// NASTAVLJAM SA OVIM TESTOM ZA KOJI SAM REKAO DA CU GA PISATI

it("if the user does not own a ticket, return 401", async () => {
  // NASTAVLJAM SA OVIM TESTOM
  // CREATING A TICKET
  const response = await createTicketResponse();

  // TICKET ID
  const { id } = response.body;

  // TRYING AN TICKET UPDATE BUT WITH DIFFERENT CREDENTIALS
  await request(app)
    .put(`/api/tickets/${id}`)
    // COOKIE BUT WITH DIFFERENT JWT
    .set(
      "Cookie",
      global.getOtherCookie({ email: "otherguy@test.com", id: "sdfdsdgfd34" })
    )
    //
    .send({ title, price })
    .expect(401);

  const response2 = await request(app)
    .get(`/api/tickets/${id}`)
    .set("Cookie", global.getCookie())
    .send();

  expect(response2.body.title).toEqual(response.body.title);
  expect(response2.body.price).toEqual(response.body.price);
});

// -------------------

// ...

it("returns 400, if price or title is invalid", async () => {
  // OVDE NECU PRAVITI NIKAKV NOVI TICKET
  // JER PLANIRA DA U HANDLERU DAKLE RETURN-UJEM EARLY
  // AKO JE NEKI INPUT INVALID
  // (ZATO STO CU KORISTITI validateRequest MIDDLEWARE
  // KOJI CE THROW-OVATI ONE ERRORS, KOJE CE U REQUEST UBACITI
  // body-JI (MIDDLEWARE-OVI express-validator-A KOJE CU ISTIO POSTAVITI))

  await request(app)
    // ZATO GENERISEM id NA SLEDECI NACIN
    .put(`/api/tickets/${new Types.ObjectId().toHexString()}`)
    .set("Cookie", global.getCookie())
    // UBACICU NESTO NEVALIDNO
    .send({
      price: -90,
      title: "Something",
    })
    .expect(400);

  //

  await request(app)
    .put(`/api/tickets/${new Types.ObjectId().toHexString()}`)
    .set("Cookie", global.getCookie())
    // UBACICU NESTO NEVALIDNO
    .send({
      price: 306,
      title: "",
    })
    .expect(400);
});
