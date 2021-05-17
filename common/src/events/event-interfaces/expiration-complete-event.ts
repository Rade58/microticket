import { ChannelNamesEnum as CNE } from "../channel-names";

export interface ExpirationCompleteEventI {
  channelName: CNE.expiration_complete;
  data: {
    orderId: string;
  };
}
