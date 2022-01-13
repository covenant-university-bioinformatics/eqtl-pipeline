import { Message, Stan, Subscription } from 'node-nats-streaming';
import { Subjects } from '@cubrepgwas/pgwascommon';
import { Inject } from '@nestjs/common';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  @Inject('NatsClient') protected client: Stan;
  abstract subject: T['subject'];
  abstract queueGroupName: string;
  protected ackWait = 5 * 1000;
  abstract onMessage(data: T['data'], msg: Message): void;
  // constructor(@Inject('NatsClient') private client: Stan) {}
  // constructor(private moduleRef: ModuleRef) {}

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable() //send all events to a new service
      .setManualAckMode(true) //manually acknowledge consumption of event
      .setAckWait(this.ackWait) //number of seconds to wait for service to acknowledge receipt
      .setDurableName(this.queueGroupName); //keep processed events and send only unprocessed;
  }

  listen() {
    console.log(this.subject + ' channel listening...');
    const subscription: Subscription = this.client.subscribe(
      this.subject, //channel name
      this.queueGroupName,
      this.subscriptionOptions(),
    );

    subscription.on('message', (msg: Message) => {
      console.log(
        `Personnel Message received ${this.subject} / ${this.queueGroupName}`,
      );

      const parsedData = this.parseMessage(msg);

      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message) {
    const data = msg.getData();
    return typeof data === 'string'
      ? JSON.parse(data) //parse string
      : JSON.parse(data.toString('utf8')); //parse buffer
  }
}
