import { ChannelNamesEnum as CNE } from "../channel-names";
import { OrderStatusEnum as OSE } from "../types/order-status-enum";

export interface OrderCreatedEventI {
  channelName: CNE.order_created;
  data: {
    id: string;
    expiresAt: string;
    status: OSE;
    userId: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}
