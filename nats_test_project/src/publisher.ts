import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

const stan = nats.connect("microticket", "abc", {
  url: "http://localhost:4222",
});

// OVO MOZE BITI async CALLBACK
stan.on("connect", async () => {
  console.log("Publisher connected to NATS");

  const ticketCretedPublisher = new TicketCreatedPublisher(stan);

  // A OVO MOGU AWAIT-OVATI

  await ticketCretedPublisher.publish({
    id: "sfsfsf",
    price: 69,
    title: "Stavros concerto",
  });

  // I OVDE STMAPAM DA JE EVENT USPESNO POSLAT
  // AKO PUBLISHING NIJE SUCCESSFUL, NI JEDAN CODE OVDE
  // NE BI TREBALO DA SE IZVRSI
  console.log("Event is successfully published");
});
