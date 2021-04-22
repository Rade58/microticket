import nats from "node-nats-streaming";

const stan = nats.connect("microticket", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", () => {
  console.log("Publisher connected to NATS");

  // OVO JE DATA, KOJI CU PUBLISH-OVATI
  // NA PRIMER OVO JE TICKE KOJI JE KREIRAN
  // MEDJUTIM MI MOZEMO SHARE-OVATI SMO STRINGS,
  // ODNOOSNO RAW DATA
  // ZATO MORAMO CONVERTOVATI TO JSON
  const data = JSON.stringify({
    id: "123",
    title: "concert",
    price: 20,
  });

  // POZIVAM stan.publish

  // PRVO IDE SUBJECT (CHANELL) PA ONDA DATA
  // A THIRD OPTIONAL ARGUMENT JE CALLBACK FUNCTION
  // FUNKCIJA CE BITI INVOKED AFTER WE PUBLISH DATA
  stan.publish("ticket:created", data, () => {
    console.log("Event published");
  });
});
