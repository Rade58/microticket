import { ChannelNamesEnum as CNE } from "../channel-names";
import { OrderStatusEnum } from "../types/order-status-enum";

export interface OrderCreatedEventI {
  channelName: CNE.order_created;
  data: {
    id: string;
    expiresAt: string;
    status: OrderStatusEnum;
    userId: string;
    ticket: {
      id: string;
      price: number;
    };
  };
}
