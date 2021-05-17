import { Error, Types } from "mongoose";
import { OrderStatusEnum as OSE } from "@ramicktick/common";
import { Order } from "../order.model";
import { Ticket } from "../ticket.model";

// OVAJ ERROR BI TREBALO DA BUDE THROWN, AKO SE DESI
// PROBLEM VEZAN ZA CONCURRENCY
const VersionError = Error.VersionError;

const { ObjectId } = Types;

it("optimistic concurrency control is working", async (done) => {
  const userId = ObjectId();

  // KREIRAM Ticket DOKUMENT
  const ticket = await Ticket.create({
    title: "Stavros the cool",
    price: 69,
  });

  // KREIRAM Order DOKUMENT
  const order = await Order.create({
    ticket: ticket.id,
    status: OSE.created,
    userId,
    expiresAt: new Date(),
  });

  // ZELIM DA QUERY-UJEM ISTI DOKUMENT DVA PUTA
  // A ZASO?
  // PA SIMULIRAM DVA PARALALNA PROCES-A
  // KOJI SU SLUCAJNO U ISTO VREME UZELI OVAJ DOKUMENT
  // KAD KAZEM PROCESS-A, MISLIM NA PRIMER
  // NA DVE INSTANCE ISTOG MICROSERVICE-A
  const sameOrder1 = await Order.findById(order.id);
  const sameOrder2 = await Order.findById(order.id);
  // OBE OVE POJAVE DOKUMENTA IMAJU `version` FIELD,
  // KOJI IMA VALUE NULA (`0`)

  // ZELIM DA UPDATE-UJEM DOKUMENT, ALI KORISCENJEM PRVE INSTANCE,
  // ILI PRVE POJAVE ISTOG DOKUMENTA
  if (sameOrder1) {
    sameOrder1.set("status", OSE.awaiting_payment);

    // MOZMO DA SAVE-UJEMO STO JE KRUCIJALNO
    await sameOrder1.save();

    // I U OVOM TRENUTKU version OVOG DOKUMENTA, BI TREBLO
    // DA BUDE 1
    expect(sameOrder1.version).toEqual(1);
  }

  if (sameOrder2) {
    // I OVO JE MOZDA NAJVANIJA STVAR KOJU MOZES DA PRIMETIS
    // PA ONA DRUGA POJAVA DOKUMENTA I DALJE IMA version, SA
    // VREDNOSCU NULA
    expect(sameOrder2.version).toEqual(0);

    // SADA ZELIMO DA UPDATE-UJEMO DRUGU INSTANCU ISTOG Order-A
    // **** I AKO JE SVE KAKO TREBA ****
    // ****  OVO BI TREBALO DA FAIL-UJE ****
    // TREBALO BI DA THROW-UJE  mongoose.Error.VersionError

    // POZIVAM set CIME INICIRAM UPDATE, ALI GA JOS NE EXECUTE-UJEM
    // JER ZA TO JE ODGOVORAN save
    sameOrder2.set("status", OSE.complete);
    try {
      // SAM POZIV save-A BI TREBAO DA THROW-UJE ERROR
      // JER TI IMAS DOKUMENT U DATBASE-U KOJI VEC IMA version:1
      // A DOKUMENT KOJI UPDATE-UJES IMA version: 0

      // DAKLE IMAS INCONSISTANCY U POGLEDU version FIELD-A

      await sameOrder2.save();
    } catch (err) {
      // SADA MOZEMO DA PRVIMO EXPECTATION U POGLEDU TIPA ERROR, KOJ ICE SE DESITI

      expect(err).toBeInstanceOf(VersionError);

      done();
    }
  }
});
