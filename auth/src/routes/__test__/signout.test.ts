import request from "supertest";
import { app } from "../../app";

it("response shouldn't have cookie on it", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({ email: "louis@mail.com", password: "PortoSomeone66" })
    .expect(201);

  const response = await request(app)
    .get("/api/users/signout")
    .send()
    .expect(200);

  // EVO VIDIS
  expect(response.get("Set-Cookie")[0]).toEqual(
    "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
  );
});
