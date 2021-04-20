import request from "supertest";
import { app } from "../../app";

it("returns 404 if the ticket is not found", async () => {
  // BITNO JE DA ID IMA 12 KARAKTERA
  // TO JE JER CE SE PRI GETTINGU BY ID DESITI CastError
  // KOJI CE THROW-OVATI MONGOOSE, PREDPOSTAVLJAM
  const someRandomId = "sfsdsdfasd46";
  // TO SAM TEK NAKNADNO SAZNAO, TAKO STO SAM STAMPAO RESPONSE

  const response = await request(app)
    .get(`/api/tickets/${someRandomId}`)
    .set("Cookie", global.getCookie())
    .send();

  // MOZE I OVAKO
  // expect(response.status).toEqual(404);
  // ALI MOZE I CHAINING
  expect(response.status).toEqual(404);
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
