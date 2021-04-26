import { app } from "./app";
import mongoose from "mongoose";
// EVO UVOZIM POMENUTU INSTANCU
import { natsWrapper } from "./events/nats-wrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY env variable undefined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI env variable undefined");
  }

  try {
    // OVDE CU DEFINISATI CONNECTING
    // CLIENT ID JE MORE OR LESS SOME RANDOM VALUE
    await natsWrapper.connect("microticket", "tickets-stavros-12345", {
      // I ZDAJEM URL
      url: "http://nats-srv:4222",
    });
    //

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
