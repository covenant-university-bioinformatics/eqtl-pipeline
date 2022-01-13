import config from '../config/bullmq.config';
import appConfig from '../config/app.config';
import { WorkerJob } from '../jobqueue/queue/eqtl.queue';
import { Job, QueueScheduler, Worker } from 'bullmq';
import { JobStatus, EqtlJobsModel } from '../jobs/models/eqtl.jobs.model';
import * as path from 'path';
import { EqtlPlotModel } from '../jobs/models/eqtlplot.model';
import { JobCompletedPublisher } from '../nats/publishers/job-completed-publisher';

let scheduler;

const createScheduler = () => {
  scheduler = new QueueScheduler(config.queuePlotName, {
    connection: config.connection,
    // maxStalledCount: 10,
    // stalledInterval: 15000,
  });
};

const processorFile = path.join(__dirname, 'eqtlplot.worker.js');

export const createEqtlPlotWorkers = async (
  jobCompletedPublisher: JobCompletedPublisher,
) => {
  createScheduler();

  for (let i = 0; i < config.numWorkers; i++) {
    console.log('Creating worker ' + i);

    const worker = new Worker<WorkerJob>(config.queuePlotName, processorFile, {
      connection: config.connection,
      // concurrency: config.concurrency,
      limiter: config.limiter,
    });

    worker.on('completed', async (job: Job, returnvalue: any) => {
      console.log('worker ' + i + ' completed ' + returnvalue);

      // save in mongo database
      // job is complete
      const parameters = await EqtlPlotModel.findOne({
        job: job.data.jobId,
      }).exec();

      const pathToOutputDir = `/pv/analysis/${job.data.jobUID}/${appConfig.appNamePlot}/output`;

      //update db with result files
      const finishedJob = await EqtlJobsModel.findByIdAndUpdate(
        job.data.jobId,
        {
          status: JobStatus.COMPLETED,
          EffectSizePlot: `${pathToOutputDir}//Effect_sizes.png`,
          LocusPlot: `${pathToOutputDir}/LocusPlot.png`,
          completionTime: new Date(),
        },
        { new: true },
      );

      //send email incase its a long job
      if (finishedJob.longJob) {
        await jobCompletedPublisher.publish({
          type: 'jobStatus',
          recipient: {
            email: job.data.email,
          },
          payload: {
            comments: `${job.data.jobName} has completed successfully`,
            jobID: job.data.jobId,
            jobName: job.data.jobName,
            status: finishedJob.status,
            username: job.data.username,
            link: `tools/${appConfig.appNamePlot}/result_view/${finishedJob._id}`,
          },
        });
      }
    });

    worker.on('failed', async (job: Job) => {
      console.log('worker ' + i + ' failed ' + job.failedReason);
      //update job in database as failed
      //save in mongo database
      const finishedJob = await EqtlJobsModel.findByIdAndUpdate(
        job.data.jobId,
        {
          status: JobStatus.FAILED,
          failed_reason: job.failedReason,
          completionTime: new Date(),
        },
        { new: true },
      );

      if (finishedJob.longJob) {
        await jobCompletedPublisher.publish({
          type: 'jobStatus',
          recipient: {
            email: job.data.email,
          },
          payload: {
            comments: `${job.data.jobName} has failed to complete`,
            jobID: job.data.jobId,
            jobName: job.data.jobName,
            status: finishedJob.status,
            username: job.data.username,
            link: `tools/${appConfig.appNamePlot}/result_view/${finishedJob._id}`,
          },
        });
      }
    });

    // worker.on('close', () => {
    //   console.log('worker ' + i + ' closed');
    // });

    process.on('SIGINT', () => {
      worker.close();
      console.log('worker ' + i + ' closed');
    });

    process.on('SIGTERM', () => {
      worker.close();
      console.log('worker ' + i + ' closed');
    });

    process.on('SIGBREAK', () => {
      worker.close();
      console.log('worker ' + i + ' closed');
    });

    console.log('Worker ' + i + ' created');
  }
};
