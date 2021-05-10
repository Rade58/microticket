import Queue from "bull";
// UVOZIM POMENUTOG PUBLISHER-A
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publisher";
// UVOZIMO I  natsWrapper
import { natsWrapper } from "../events/nats-wrapper";
// ----------------------------------------

interface PayloadI {
  orderId: string;
}

export const expirationQueue = new Queue<PayloadI>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  //
  const { orderId } = job.data;

  // EVO OVDE PUBLISH-UJEMO EVENT

  await new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId,
  });
});
