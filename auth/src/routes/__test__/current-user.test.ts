import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user signed in", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "stavros@mail.com",
      password: "CoolAdamCool66",
    })
    .expect(201);

  const response = await request(app)
    .get("/api/users/current-user")
    .send()
    .expect(200);

  console.log(response.body);
});
