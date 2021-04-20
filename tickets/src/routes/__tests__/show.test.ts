import request from "supertest";
import { app } from "../../app";

//UVOZIM IZ mongoose-A
import { Types } from "mongoose";

it("returns 404 if the ticket is not found", async () => {
  // UZ POMOC OVOGA KRIRAM ID
  const someRandomId = new Types.ObjectId();

  // const someRandomId = "sfsdsdfasd46";
  // const someRandomId = "sfsds";
  //

  const response = await request(app)
    .get(`/api/tickets/${someRandomId}`)
    .set("Cookie", global.getCookie())
    .send();

  expect(response.status).toEqual(404);
});

it("returns the ticket if the ticket is found", async () => {
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

  expect(response2.status).toEqual(200);

  expect(response2.body.title).toEqual(title);
  expect(response2.body.price).toEqual(price);
});
