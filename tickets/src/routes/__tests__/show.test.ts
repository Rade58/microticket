import request from "supertest";
import { app } from "../../app";

it("returns 404 if the ticket is not found", async () => {
  const someRandomId = "sfsdgdgd3534534";

  const response = await request(app)
    .get(`/api/tickets/${someRandomId}`)
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
    });

  const { id } = response1.body;

  const response2 = await request(app).get(`/api/tickets/${id}`).send();

  expect(response2.status).toEqual(200); // I OVO SI MOGAO DA CHAIN-UJES ALI NEMA VEZE

  expect(response2.body.title).toEqual(title);
  expect(response2.body.price).toEqual(price);
});
