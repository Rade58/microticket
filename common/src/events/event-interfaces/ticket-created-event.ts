import { ChannelNamesEnum as CNE } from "../channel-names";

export interface TicketCreatedEventI {
  channelName: CNE.ticket_created;
  data: {
    id: string;
    //
    version: number;
    //
    title: string;
    price: number;
    userId: string;
  };
}
