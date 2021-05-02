import { ChannelNamesEnum as CNE } from "../channel-names";

export interface OrderCancelledI {
  channelName: CNE.order_cancelled;
  data: {
    id: string;
    ticket: {
      id: string;
    };
  };
}
