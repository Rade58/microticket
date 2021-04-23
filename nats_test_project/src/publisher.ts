import nats from "node-nats-streaming";

// EVO OVDE MOZES POZVATI console.clear
console.clear();
// I TO CE POCIITI ONE LOGS KOJI NASTANU
// OD TOOLS SA KOJIM RUNN-UJES SCRIPT
// U OVOM SLUCAJU TO JE ts-node-dev
//
//
//

const stan = nats.connect("microticket", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });
  //

  stan.publish("ticket:created", data, () => {
    console.log("Event published");
  });
});
//
//
//
//
