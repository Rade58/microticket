import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
// PORED GORNJIH STVRI UVOZIM I MOJ EXPRESS APP
import { app } from "../app";

// ONAJ MongoMemoryServer OMOGUCICE MI DA MOGU DA SPINN-UJEM ONE IN MEMOR DATBASES PRE TESTOVA
// MENI TREBA SAMO JEDAN IN MEMORY DATABSE

// SA MongoMemoryServer CEMO SPIN-OVATI IN MEMORY MONGO DATBASE

// OVO RADIM U SPOLJASNJEM OBIMU JER CE RAZLICITI HOOK-OVI KORISTITI
// mongo
let mongo: any; // ZA SAADA JE UNDEFINED A UNUTAR HOOKA CE BITI ASSIGNED

// TI SADA MOZES KORISTITI NEKE JEST FUNKCIJE (BEZ IKAKVOG UVOZA)
// TO SU USTVARI HOOKS JEST-A
beforeAll(async () => {
  // OVAJ HOOK CE SE RUNN-OVATI PRE EXECUTIONA TEST-OVA

  // INSTANCU MONGO MEMORY SERVER-A DODELJUJEM ONOJ
  // SPOLJASNJOJ VARIJABLOJ
  mongo = new MongoMemoryServer();

  // KONEKTOVACEMO MONGOOSE TO IN MEMORY MONGO
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// OVAJ HOOK  CE SSE RUN-OVATI ZA SVAKI NAS INDIVIDUAL TEST
beforeEach(async () => {
  // PRE SVAKOG TESTA ZELIMO DA REACH-UJEMO U IN MEMORY DATBASE I
  // RESET-UJEMO ALL THE DATA INSIDE, DAKLE RADIMO WIPE
  // BRISEMO SVE KOLEKCIJE
  const collections = await mongoose.connection.db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// A KADA SEE ZAVRSE SVI TE

// U OVOM HOOK-U (KOJI SE RUNN-UJE AFTER TESTS) TREBA DA ZAUSTAVIMO MONGODB MEMORY SERVER
// I TREBAMO MONGOOSE DA DISCONNET-UJEMO FROM IT
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
