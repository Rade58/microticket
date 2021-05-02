import request from "supertest";
import { app } from "../../app";

it("returns 200, and returns empty array if no orders", async () => {
  await request(app)
    .get("/api/orders")
    .set("Cookie", global.getCookie())
    .send()
    .expect(200);
});
