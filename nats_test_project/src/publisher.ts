import nats from "node-nats-streaming";

// UVOZIMO SADA NASU KLASU CUSTOM PUBLISERA
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect("microticket", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  // OVO SADA NE RADIMO OVAKO

  /* const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });


  stan.publish("ticket:created", data, () => {
    console.log("Event published");
  }); */

  // VEC OVAKO

  const ticketCretedPublisher = new TicketCreatedPublisher(stan);

  ticketCretedPublisher.publish({
    id: "sfsfsf",
    price: 69,
    title: "Stavros concerto",
  });
});
