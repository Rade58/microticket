import { ChannelNamesEnum as CNE } from "../channel-names";

export interface TicketCreatedEventI {
  channelName: CNE.ticket_created;
  data: {
    id: string;
    title: string;
    price: number;
    userId: string;
  };
}
