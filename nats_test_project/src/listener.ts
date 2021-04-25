import { connect } from "node-nats-streaming";
import { randomBytes } from "crypto";

// OVDE UVOZIMO NASU KLASU, NE UVOZIMO ABSTRACTNU NARAVNO
import { TicketCreatedListener } from "./events/tickets-created-listener";
// I NIST VISE NE MORAMO DA RADIMO

console.clear();

const stan = connect("microticket", randomBytes(4).toString("hex"), {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  stan.on("close", () => {
    console.log("NATS connection closed!");
    process.exit();
  });

  const ticketCreatedListener = new TicketCreatedListener(stan);

  ticketCreatedListener.listen();
});

process.on("SIGINT", () => {
  stan.close();
});
process.on("SIGTERM", () => {
  stan.close();
});
