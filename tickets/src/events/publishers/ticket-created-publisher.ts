import { Stan } from "node-nats-streaming";

import {
  Publisher,
  TicketCreatedEventI,
  ChannelNamesEnum as CNE,
} from "@ramicktick/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEventI> {
  public channelName: CNE.ticket_created;

  // TAKODJE KONSTRUKTORA NISI NI MORAO DEFINISATI
  // MOGAO SI GORE ASSIGNOVATI ODMAH VREDNOST DO channelName
  // I NE BI MORAO DEFINISATI CONSTRUKTORA
  // TO TI TYPESCRIOT DOZVOLJAVA, ODNOSNO DOZVOLJAVA TI SHORTHAND
  // SINTAKSU

  constructor(stan: Stan) {
    super(stan);

    this.channelName = CNE.ticket_created;

    Object.setPrototypeOf(this, TicketCreatedPublisher.prototype);
  }
}

// NISTA TI NE TREBA OVDE VISE
// SECAS SE DA TI JE publish VEC POTPUNO DEFINISANO
// ONA NIJE ABSTRACT METODA
// ABTRACT PROPERTI JE JEDINO BIO channelName
