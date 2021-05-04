import { Ticket } from "../ticket.model";
import { Error } from "mongoose";

// OVAJ ERROR BI TREBALO DA BUDE THROWN, AKO SE DESI
// PROBLEM VEZAN ZA CONCURRENCY
const VersionError = Error.VersionError;

it("optimistic concurrency control is working", async (done) => {
  // KREIRAM DOKUMENT
  const ticket = await Ticket.create({
    title: "something",
    price: 69,
  });

  // ZELIM DA QUERY-UJEM ISTI DOKUMENT DVA PUTA
  // A ZASO?
  // PA SIMULIRAM DVA PARALALNA PROCES-A
  // KOJI SU SLUCAJNO U ISTO VREME UZELI OVAJ DOKUMENT
  // KAD KAZEM PROCESS-A, MISLIM NA PRIMER
  // NA DVE INSTANCE ISTOG MICROSERVICE-A
  const sameTicket1 = await Ticket.findById(ticket.id);
  const sameTicket2 = await Ticket.findById(ticket.id);
  // OBE OVE POJAVE DOKUMENTA IMAJU `version` FIELD,
  // KOJI IMA VALUE NULA (`0`)

  // ZELIM DA UPDATE-UJEM DOKUMENT, ALI KORISCENJEM PRVE INSTANCE,
  // ILI PRVE POJAVE ISTOG DOKUMENTA
  if (sameTicket1) {
    sameTicket1.set("price", 58);

    // MOZMO DA SAVE-UJEMO STO JE KRUCIJALNO
    await sameTicket1.save();

    // I U OVOM TRENUTKU version OVOG DOKUMENTA, BI TREBLO
    // DA BUDE 1
    expect(sameTicket1.version).toEqual(1);
  }

  if (sameTicket2) {
    // I OVO JE MOZDA NAJVANIJA STVAR KOJU MOZES DA PRIMETIS
    // PA ONA DRUGA POJAVA DOKUMENTA I DALJE IMA version, SA
    // VREDNOSCU NULA
    expect(sameTicket2.version).toEqual(0);

    // SADA ZELIMO DA UPDATE-UJEMO DRUGU INSTANCU ISTOG TICKET-A
    // **** I AKO JE SVE KAKO TREBA ****
    // ****  OVO BI TREBALO DA FAIL-UJE ****
    // TREBALO BI DA THROW-UJE  mongoose.Error.VersionError

    // POZIVAM set CIME INICIRAM UPDATE, ALI GA JOS NE EXECUTE-UJEM
    // JER ZA TO JE ODGOVORAN save
    sameTicket2.set("title", "Stavros the Mighty");
    try {
      // SAM POZIV save-A BI TREBAO DA THROW-UJE ERROR
      // JER TI IMAS DOKUMENT U DATBASE-U KOJI VEC IMA version:1
      // A DOKUMENT KOJI UPDATE-UJES IMA version: 0

      // DAKLE IMAS INCONSISTANCY U POGLEDU version FIELD-A

      await sameTicket2.save();
    } catch (err) {
      // SADA MOZEMO DA PRVIMO EXPECTATION U POGLEDU TIPA ERROR, KOJ ICE SE DESITI

      expect(err).toBeInstanceOf(VersionError);

      done();
    }
  }
});
