# TESTING NON AUTHENTICATED REQUESTS

NAPRAVICU JOS JEDAN TEST ZA current-user HANDLER, A OCEKUJEM DA body.currenUser BUDE null U RESPONSE-U, KADA NIJE OBEZBEDJEN COOKIE

- `code auth/src/routes/__test__/current-user.test.ts`

```ts
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

```

TEST JE PASS-OVAO
