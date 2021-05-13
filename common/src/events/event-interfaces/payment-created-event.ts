import { ChannelNamesEnum as CNE } from "../channel-names";

export interface PaymentCreatedEventI {
  channelName: CNE.payment_created;
  data: {
    id: string;
    orderId: string;
    stripeChargeId: string;
  };
}
