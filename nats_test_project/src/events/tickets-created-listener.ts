import { Stan, Message } from "node-nats-streaming";
import { Listener } from "./abstr-listener";
// UVOZIM INTERFACE, KOJI TYPE-UJE channelName I data
// KAKO BI GA KORISTIO KAO GENERIC ZA Listener ABSTRACT KLASU
// KADA IZ NE EXTEND-UJEM

import { TicketCreatedEventI } from "./ticket-created-event";

// ALI MORACU DA UVEZEM I ENUM JER SAMO S NJIM MOGU ZADATI
// KOJI CE TO TYPE IMATI channelName
import { ChannelNamesEnum as CNE } from "./channel-names";

// PROSLEDIO SAM GA KO GENERIC
export class TicketCreatedListener extends Listener<TicketCreatedEventI> {
  // PREM TOME OVO NE VALJA
  // public channelName: string;
  // MORA OVAKO
  public channelName: CNE.ticket_created;
  // IAKO OVO OVKO IZGLEDA CUDNO TI SI OVO OVAKO MORAO URADITI
  // JER JE channelName BIO ABSTRACT FIELD Listener KLASE
  // STO ZNACI DA GA OVDE IZNAD MORAS TYPE-OVATI
  // A U KONSTRUKTORU GA MORAS INICIJALIZOVATI
  // JEDINO TAKO TYPESCRIPT NECE VIKTI NA TEBE

  public queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    // DAKLE OVO NE VALJA
    // this.channelName = "ticket:created";
    // MORA OVAKO
    this.channelName = CNE.ticket_created;
    //

    this.queueGroupName = "payments-service";

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  // ALI NI OVDE parsedData NIJE TYPED
  // ODNOSNO TI MOZES STAVITI I any TYPE A TYPESCRIPT NECE YELL-OVATI NA TEBE
  // ALI TO JE SAMO U SLUCAJU SA any (TI SHVATI ZASTO KAD VIDIS STA EXTEND-UJE GENERIC I ABSTRACT KLASE)
  // NE ZNAM ZASTO JE TO TAKO, ALI SAM, RUCNO TYPE-OVAO
  // parsedData
  // OVO JE VISE SLUZILO DA SE POGRESAN TYPING NE DOZVOLI
  // BITNO JE RECI DA BI TYPESCRIPT YELL-OVAO NA MENE DA
  // SAM DOLE STAVIO POGRESNE TYPE-OVE ZA ARGUMENTR
  // parsedData SME BITI any TAKODJE ,ALI msg SAM OSME BITI msg
  // NIJE DA CU IKADA KORISTITI any, LAI GOVORIM TI STA JE
  // RELEVANTNO

  onMessage(parsedData: TicketCreatedEventI["data"], msg: Message) {
    console.log("Event data!", parsedData);
    msg.ack();

    // SADA KADA ZELIS DA RADIS NESTO SA DATA, KUUCANJEM
    // parsedData.      IZLISTACE TI SE MOGUCI FIELD-OVI
  }
}
