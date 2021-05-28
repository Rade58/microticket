import { natsWrapper } from "./events/nats-wrapper";
// UVESCU LISTENER
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const start = async () => {
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID env variable is undefined");
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID env variable is undefined");
  }
  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL env variable is undefined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID as string,
      process.env.NATS_CLIENT_ID as string,
      {
        url: process.env.NATS_URL,
      }
    );

    natsWrapper.client.on("close", () => {
      console.log("Connection to NATS Streaming server closed");
      process.exit();
    });

    const sigTerm_sigInt_callback = () => {
      natsWrapper.client.close();
    };
    process.on("SIGINT", sigTerm_sigInt_callback);
    process.on("SIGTERM", sigTerm_sigInt_callback);

    // MOGU OVDE DA PODESIM LISTENING ---------------------
    new OrderCreatedListener(natsWrapper.client).listen();
    // ----------------------------------------------------
  } catch (err) {
    console.error(err);
  }
};

start();
