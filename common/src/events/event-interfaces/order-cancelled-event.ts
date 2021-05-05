import { ChannelNamesEnum as CNE } from "../channel-names";

export interface OrderCancelledEventI {
  channelName: CNE.order_cancelled;
  data: {
    id: string;
    // EVO U SKLOPU data, ZADAO SAM TAJ     version
    version: number;
    //
    ticket: {
      id: string;
    };
  };
}
