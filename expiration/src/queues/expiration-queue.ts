import Queue from "bull";

interface PayloadI {
  orderId: string;
}

export const expirationQueue = new Queue<PayloadI>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

// EVO OVO JE TO

expirationQueue.process(async (job) => {
  // NA job-U ,LAKO MOZES VIDETI STA MOZE DA BUDE
  job.data.orderId;

  // job OBJECT JE SIMILR IN NATURE, KAO ONAJ msg: Message
  // KADA LISTEN-UJEMO FOR THE EVENT, KORISTECEI node-nats-streaming

  // PORED data NA job-U IMA MNOGO STAVI, OD DATE, KADA JE INITIALLY
  // CREATED, ILI NEKI ID OF JOB ITSELF ILI WHAT EVER ELSE

  // EVENTUALLY MI CEMO OVDE PUBLISH-OVATI `"expiration:complete"` EVENT
  // AL IZA SADA CEMO SAM ONA NESTO LOG-UJEMO

  console.log(
    "I want to publish event to 'expiration:complete' channel. Event data --> orderId",
    job.data.orderId
  );
});
