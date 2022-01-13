import { Queue } from 'bullmq';
import config from '../../config/bullmq.config';
import { Injectable } from '@nestjs/common';
import { WorkerJob } from './eqtl.queue';

@Injectable()
export class EqtlPlotJobQueue {
  queue: Queue<WorkerJob, any, string>;

  constructor() {
    this.queue = new Queue<WorkerJob>(config.queuePlotName, {
      connection: config.connection,
      // limiter: { groupKey: config.limiter.groupKey },
    });
    console.log(config);
  }

  async addJob(jobData: WorkerJob) {
    return await this.queue.add(jobData.jobName, jobData);
  }
}
