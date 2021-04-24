import nats from "node-nats-streaming";

console.clear();

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

  // IZ KOJG SE PUBLISH-UJE EVENT U SPECIFICIRANI KANAL
  // ODMAH PO KONEKTU
  // ALI KAO SE SECAS MI SMO TO TAKO PODESILI DA
  // BI EVENTE SLAO RESTARTINGOM SAMO SCRIPTA KOJI POKRECE OVAJ FILE
  // OVO JE SAMO DAKLE ZA TESTIRANJE
  stan.publish("ticket:created", data, () => {
    console.log("Event published");
  });
});
//
//
//
//
//
//
//

//

//

//
