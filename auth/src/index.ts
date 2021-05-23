// UVOZIM app
import { app } from "./app";
// A OVO TREBA ZA DATABASE CONNECTION
import mongoose from "mongoose";

//
const start = async () => {

  console.log({NODE_ENV: process.env.NODE_ENV})

  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI env variable undefined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });

    console.log("Connected to DB");
  } catch (err) {
    console.log("Failed to connect to DB");
    console.log(err);
  }

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`listening on  http://localhost:${PORT} INSIDE auth POD`);
  });
};

start();
