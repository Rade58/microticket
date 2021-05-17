import request from "supertest";
import { app } from "../../app";

const createTicket = async () => {
  return request(app)
    .post("/api/tickets/")
    .set("Cookie", global.getCookie())
    .send({
      title: "Stavros listening",
      price: 126,
    })
    .expect(201);
};

it("it returns 200 on gettin all tickets", async () => {
  // LETS CREATE SOME TICKETS FIRST
  await createTicket();
  await createTicket();
  await createTicket();
  await createTicket();

  const response = await request(app).get("/api/tickets").send();

  expect(response.status).toEqual(200);

  console.log(response.body);

  expect(response.body.length).toBeGreaterThan(0);

  expect(response.body[0]).toHaveProperty("userId");
  expect(response.body[0]).toHaveProperty("title");
  expect(response.body[0]).toHaveProperty("price");
  expect(response.body[0]).toHaveProperty("id");
});
