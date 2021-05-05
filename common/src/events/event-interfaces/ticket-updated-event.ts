import { ChannelNamesEnum as CNE } from "../channel-names";

export interface TicketUpdatedEventI {
  channelName: CNE.ticket_updated;
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
