import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

// TREBA MI supertest
import request from "supertest";
// TREBA MI I OVO
import { app } from "../app";

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "test";

  mongo = new MongoMemoryServer();

  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

// REAKO SAM TI ZATO STO OVU FUNKCIJU DEFINISES OVDE, KAO GLOBAL,
// ONA CE BITI JEDINO AVAILABLE U TEST ENVIROMENT-U

// PRE DEFINISANJA FUNKCIJE DA BI PRAVILNO TYPE-OVAO
// GLOBALNU FUNKCIJU, JEDINO SAM MOGAO DA TYPE-UJEM OVAKO
declare global {
  // eslint-disable-next-line
  namespace NodeJS {
    interface Global {
      // FINKCIJA CE DA RETURN-UJE PROMISE
      // COOKIE-JEM (VREDNOSCU COOKIE-A JA ARRAY)
      // TAKO SAM TO I TYPE-OVAO
      makeRequestAndTakeCookie(): Promise<{
        cookie: string[];
      }>;
    }
  }
}

// DEFINISEM TU METODU
global.makeRequestAndTakeCookie = async () => {
  const email = "stavros@stavy.com";
  const password = "SuperCoolPerson66";

  const response = await request(app)
    .post("/api/users/signup")
    .send({ email, password }) // NE TREBA TI EXPECTATION
    // JER NIJE U FOKUSU (OVO SE OCEKUJE DA UVEK PRODJE)
    // ALI JA SAM GA IPAK STAVIO
    .expect(201);

  // UZIMAMO COOKIE
  const cookie = response.get("Set-Cookie");

  // console.log({ cookie });

  // MI SADA MOEMO RETURN-OVATI COOKIE

  return { cookie };
};
