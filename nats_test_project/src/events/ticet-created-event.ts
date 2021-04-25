import { ChannelNamesEnum as CNE } from "./channel-names";

export interface TicketCreatedEventI {
  subject: CNE.ticket_created;
  data: {
    id: string;
    title: string;
    price: number;
  };
}
