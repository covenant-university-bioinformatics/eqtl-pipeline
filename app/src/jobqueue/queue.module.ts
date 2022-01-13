import { Inject, Module, OnModuleInit } from '@nestjs/common';
import { createWorkers } from '../workers/eqtl.main';
import { EqtlJobQueue } from './queue/eqtl.queue';
import { NatsModule } from '../nats/nats.module';
import { JobCompletedPublisher } from '../nats/publishers/job-completed-publisher';
import { createEqtlPlotWorkers } from '../workers/eqtlplot.main';
import { EqtlPlotJobQueue } from './queue/eqtlplot.queue';

@Module({
  imports: [NatsModule],
  providers: [EqtlJobQueue, EqtlPlotJobQueue],
  exports: [EqtlJobQueue, EqtlPlotJobQueue],
})
export class QueueModule implements OnModuleInit {
  @Inject(JobCompletedPublisher) jobCompletedPublisher: JobCompletedPublisher;
  async onModuleInit() {
    await createWorkers(this.jobCompletedPublisher);
    await createEqtlPlotWorkers(this.jobCompletedPublisher);
  }
}
