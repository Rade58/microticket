import { ChannelNamesEnum as CNE } from "./channel-names";

export interface TicketUpdatedEventI {
  channelName: CNE.ticket_updated;
  data: {
    id: string;
    title: string;
    price: number;
    // BICE OVDE JOS INFORMACIJA, PREDPOSTAVLJAM ZA
    // VESRION (KOJI BI SE TICAO RESAVANJA CONCURRENCY PROBLEMA),
    //  ALI CU TO TEK KASNIJE DODAVATI
    // MEDJUTIM TREBALO BI DA ZADAM I userId
    userId: string;
  };
}
