import request from "supertest";
import { app } from "../../app";

it("responds with details about the current user signed in", async () => {
  const { cookie } = await global.makeRequestAndTakeCookie();

  const response = await request(app)
    .get("/api/users/current-user")
    .set("Cookie", cookie)
    .send()
    .expect(200);

  console.log(response.body);
});

// EVO PRAVIM NOVI TEST
it("if user isn't signed in, respods with 200, but currentUser is null", async () => {
  const response = await request(app)
    .get("/api/users/current-user")
    .send()
    .expect(200);


  expect(response.body.currentUser).toEqual(null);

});
