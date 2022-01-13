import { NatsClient } from './nats-client';

export const natsFactory = {
  provide: 'NatsClient',
  useFactory: async () => {
    const natsClient = new NatsClient();
    await natsClient.connect(
      process?.env?.NATS_CLUSTER_ID!,
      process?.env?.NATS_CLIENT_ID!,
      process?.env?.NATS_URL!,
    );

    natsClient.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      natsClient.client.close();
    });

    process.on('SIGTERM', () => {
      natsClient.client.close();
    });

    process.on('SIGBREAK', () => {
      natsClient.client.close();
    });

    return natsClient.client;
  },
};
