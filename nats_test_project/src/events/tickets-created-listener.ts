import { Stan, Message } from "node-nats-streaming";
import { Listener } from "./abstr-listener";

export class TicketCreatedListener extends Listener {
  public channelName: string;
  public queueGroupName: string;

  constructor(stanClient: Stan) {
    super(stanClient);

    this.channelName = "ticket:created";
    this.queueGroupName = "payments-service";

    Object.setPrototypeOf(this, TicketCreatedListener.prototype);
  }

  onMessage(parsedData: any, msg: Message) {
    console.log("Event data!", parsedData);
    msg.ack();
  }
}
