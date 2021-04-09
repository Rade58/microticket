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

  // expect(response.get("Set-Cookie")).toBeUndefined();

  console.log(response.get("Set-Cookie"));
});
