import { Stan } from 'node-nats-streaming';
import { Subjects } from '@cubrepgwas/pgwascommon';
import { Inject, OnModuleInit } from '@nestjs/common';

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> implements OnModuleInit {
  @Inject('NatsClient') private client: Stan;
  abstract subject: T['subject'];

  constructor() {}

  publish(data: T['data']): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.subject, JSON.stringify(data), (err) => {
        if (err) return reject(err);
        else {
          console.log('Event published ', this.subject);
          resolve();
        }
      });
    });
  }

  onModuleInit(): any {
    // console.log('Pub: Is defined: ', typeof this.client !== 'undefined');
  }
}
