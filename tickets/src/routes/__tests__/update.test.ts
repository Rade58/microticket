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
});
it("if the user does not own a ticket, return 404", async () => {
  // WE MUST CREATE TICKET FIRST

  const invalidId = "isdds26";

  await request(app)
    .put(`/api/tickets/${invalidId}`)
    .set("Cookie", global.getCookie())
    .expect(404);
});
it("if the user does not own a ticket, return 404", async () => {
  // WE MUST CREATE TICKET FIRST

  const invalidId = "isdds26";

  await request(app)
    .put(`/api/tickets/${invalidId}`)
    .set("Cookie", global.getCookie())
    .expect(404);
});
