import nats from "node-nats-streaming";

// I OVDE STAVLJAM console.clear
console.clear();

const stan = nats.connect("microticket", "123", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");
});
