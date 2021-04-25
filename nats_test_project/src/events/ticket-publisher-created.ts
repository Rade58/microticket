import { Stan } from "node-nats-streaming";
import { Publisher } from "./abstr-publisher";
// UVESCEMO I ONAJ INTERFACE KOJI SMO VEC UPOTREBILI ZA TicketCreatedListener-A
import { TicketCreatedEventI } from "./ticket-created-event";
// ALI CE TREBA TI I ENUM
import { ChannelNamesEnum as CNE } from "./channel-names";

export class TicketCreated extends Publisher<TicketCreatedEventI> {
  /**
   * @description channel name (also known as subject)
   */
  public channelName: CNE.ticket_created;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = CNE.ticket_created;

    Object.setPrototypeOf(this, TicketCreated.prototype);
  }

  // METODU publish VEC NASLEDJUJES IZ ASTRCTNE KLASE
  // TAMO SI JE FULLY DEFINISAO
}
