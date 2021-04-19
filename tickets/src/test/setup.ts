import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../app";

let mongo: any;

beforeAll(async () => {
  process.env.JWT_KEY = "test"; // OVO CE TI ZNACITI JER CE TI I OVO TREBATI
  //                                I TO SAM KOPIRAO IZ auth MICROSERVICE-A
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
  //
  // KREIRATI JSON WEB TOKEN
  //
  // MORAMO KREIRTI SESSION OBJECT
  // {jwt: <JSON WEB TOKEN> }
  //
  // SESSION OBJECT PRETVORITI U JSON
  // "{"jwt": "<json web token>"}"
  //
  // UZETI TAJ JSON I ENCODE-OVATI GA INTO BASE64
  // ZANS DA TO OBICNO RADI ONAJ cookie-session PACKAGE
  // PRE PODESAVANJA COOKIE
  //
  // KONACNO RETURN-UJEMO TAJ BASE64 STRING
};
