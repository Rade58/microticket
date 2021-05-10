import Queue from "bull";

// EVO GA INTERFACE
interface PayloadI {
  orderId: string;
}

// A OVDE GA PASS-UJEMO KAO GENERIC TYPE
const expirationQueue = new Queue<PayloadI>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});
