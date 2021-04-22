import nats from "node-nats-streaming";

console.clear();

const stan = nats.connect("microticket", "123", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Listener connected to nats");

  // EVO PRAVIM SUBSCRIPTION NA "tickets:created" SUBSCRIPTION

  const subscription = stan.subscribe("ticket:created");

  // KROZ OVAJ OBJEKAT TREBAM RECEIVE-OVATI DATA
  // ALI VIDIS KAKO GORE NISAM DEFINISAO CALLBACK
  // JER CALLBACK JE NESTO SLICN OSTO BI KORISTIL DRUGI LIBRARIES
  //

  // TI CES OVDE USTVARI MORATI DEFINISATI NA KOJI TYPE EVENT-A
  // TVOJ SUBSCRIPTION LISTEN-UJE

  // JA SLUSAM NA "message" TYPE OF THE EVENT
  subscription.on("message", (msg) => {
    // ARGUMENT FUNKCIJE JESTE ACTUL MESSAGE
    // ODNOSNO DATA KOJI JE EVENT BUS PROSLEDIO IZ KANALA
    // KOJI SUBSCRIPTION LISTEN-UJE

    console.log({ msg });

    // msg NIJE RAW DATA, STO CES I VIDETI U TERMIANLU
  });
});
