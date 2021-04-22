import nats from "node-nats-streaming";

// KASNIJE CU SE VRATITI I OBJASNITI OVE ARGUMENTE
// A ZA SADA IH APISUJ
const stan = nats.connect("microticket", "123", {
  url: "http://localhost:4222",
});

// WATCH-UJEM NA CONNECT EVENT
// I OVAJ CALLBACK CE SE DAKLE IZVRSITI PPO USPESNOJ KONEKCIJI
stan.on("connect", () => {
  console.log("Listener connected to nats");
});
