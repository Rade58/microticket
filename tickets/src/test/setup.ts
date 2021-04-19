import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../app";

// UVEZAO SAM sign METHOD
import { sign } from "jsonwebtoken";
// UVOZIM I
import crypto from "crypto";
//

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

// NEKA SE FUNKCIJA ZOVE getCookie

declare global {
  // eslint-disable-next-line
  namespace NodeJS {
    interface Global {
      getCookie(): Promise<{
        // cookie: string[];
        cookie: string;
      }>;
    }
  }
}

global.getCookie = async () => {
  // MOAMO BUILD-OVATI JSON WEB TOKEN PAYLOAD
  // {id: string; email: string}

  const payload = {
    // OVO SAM SMISLIO FAKE DATA
    id: "fdfhf324325ffb",
    email: "stavros@test.com",
  };

  // KREIRATI JSON WEB TOKEN
  //
  const jwt = sign(payload, process.env.JWT_KEY as string);

  // MORAMO KREIRTI SESSION OBJECT
  // {jwt: <JSON WEB TOKEN> }
  //

  const session = { jwt };

  // SESSION OBJECT PRETVORITI U JSON
  // "{"jwt": "<json web token>"}"
  //

  const sessionJSON = JSON.stringify(session);

  // UZETI TAJ JSON I ENCODE-OVATI GA INTO BASE64
  // ZANS DA TO OBICNO RADI ONAJ cookie-session PACKAGE
  // PRE PODESAVANJA COOKIE

  const buf = Buffer.from(sessionJSON, "utf-8");

  //
  // KONACNO RETURN-UJEMO TAJ BASE64 STRING
  // ALI VODIM RACUNA DA ISPRED SEB IMA ONAJ `"express:sess="`
  // TO STAVLJAM JER COOKIE TAKO IZGLEDA KADA SAM GA PREGLEDAO
  // U BROWSERU
  return { cookie: `express:sess=${buf.toString("base64")}` };
};
