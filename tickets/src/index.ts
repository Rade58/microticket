import { app } from "./app";
import mongoose from "mongoose";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }
  // OVDE MOZEMO DA NAPRAVIMO I PROVERU ZA MONGO_URI ENV VARIABLE
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI env variable undefined");
  }

  try {
    // UMESTO OVOGA
    // await mongoose.connect("mongodb://tickets-mongo-srv:27017/tickets", {
    // KORISTIMO ENV VARIABLU
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB (tickets-mongo)");
  } catch (err) {
    console.log("Failed to connect to DB");
    console.log(err);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT} INSIDE tickets POD`);
  });
};

start();
