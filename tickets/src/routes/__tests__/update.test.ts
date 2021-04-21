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

  console.log({ response });

  const { id } = response.body;

  // SLACU REQUEST BEZ COOKIE-A I OCEKUJEM 401

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title, price })
    .expect(401);
});

// NASTAVLJAM SA OVIM TESTOM ZA KOJI SAM REKAO DA CU GA PISATI

it("if the user does not own a ticket, return 404", async () => {
  // NASTAVLJAM SA OVIM TESTOM
  // CREATING A TICKET
  const response = await createTicketResponse();

  // TICKET ID
  const { id } = response.body;

  console.log("Ticket", { id });

  // TRYING AN TICKET UPDATE BUT WITH DIFFERENT CREDENTIALS
  await request(app)
    .put(`/api/tickets/${id}`)
    // COOKIE BUT WITH DIFFERENT JWT
    .set(
      "Cookie",
      global.getOtherCookie({ email: "otherguy@test.com", id: "sdfdsdgfd34" })
    )
    //
    .send({ price })
    .expect(401);
});
