import config from '../config/bullmq.config';
import appConfig from '../config/app.config';
import { WorkerJob } from '../jobqueue/queue/eqtl.queue';
import { Job, QueueScheduler, Worker } from 'bullmq';
import { JobStatus, EqtlJobsModel } from '../jobs/models/eqtl.jobs.model';
import * as path from 'path';
import { EqtlModel, OnOffOptions } from '../jobs/models/eqtl.model';
import { JobCompletedPublisher } from '../nats/publishers/job-completed-publisher';

let scheduler;

const createScheduler = () => {
  scheduler = new QueueScheduler(config.queueName, {
    connection: config.connection,
    // maxStalledCount: 10,
    // stalledInterval: 15000,
  });
};

const processorFile = path.join(__dirname, 'eqtl.worker.js');

export const createWorkers = async (
  jobCompletedPublisher: JobCompletedPublisher,
) => {
  createScheduler();

  for (let i = 0; i < config.numWorkers; i++) {
    console.log('Creating worker ' + i);

    const worker = new Worker<WorkerJob>(config.queueName, processorFile, {
      connection: config.connection,
      // concurrency: config.concurrency,
      limiter: config.limiter,
    });

    worker.on('completed', async (job: Job, returnvalue: any) => {
      console.log('worker ' + i + ' completed ' + returnvalue);

      // save in mongo database
      // job is complete
      const parameters = await EqtlModel.findOne({
        job: job.data.jobId,
      }).exec();

      const pathToOutputDir = `/pv/analysis/${job.data.jobUID}/${appConfig.appName}/output`;

      let cageSMRFile = null;
      let cageSMRManhattanPlot = null;
      let cageSMRQQPlot = null;
      let cageTransFile = null;
      let cageMultiFile = null;
      let cageMultiManhattanPlot = null;
      let cageMultiQQPlot = null;

      if (parameters.CAGE_eqtl === 'true') {
        cageSMRFile = `${pathToOutputDir}/CAGE.smr`;
        cageSMRManhattanPlot = `${pathToOutputDir}/CAGE_manhattan.png`;
        cageSMRQQPlot = `${pathToOutputDir}/CAGE_qq.png`;
        if (parameters.trans === OnOffOptions.ON) {
          cageTransFile = `${pathToOutputDir}/CAGE_trans.smr`;
        }
        if (parameters.smr_multi === OnOffOptions.ON) {
          cageMultiFile = `${pathToOutputDir}/CAGE_multi.msmr`;
          cageMultiManhattanPlot = `${pathToOutputDir}/CAGE_multi_manhattan.png`;
          cageMultiQQPlot = `${pathToOutputDir}/CAGE_multi_qq.png`;
        }
      }

      let westraSMRFile = null;
      let westraSMRManhattanPlot = null;
      let westraSMRQQPlot = null;
      let westraTransFile = null;
      let westraMultiFile = null;
      let westraMultiManhattanPlot = null;
      let westraMultiQQPlot = null;

      if (parameters.Westra_eqtl === 'true') {
        westraSMRFile = `${pathToOutputDir}/Westra.smr`;
        westraSMRManhattanPlot = `${pathToOutputDir}/Westra_manhattan.png`;
        westraSMRQQPlot = `${pathToOutputDir}/Westra_qq.png`;
        if (parameters.trans === OnOffOptions.ON) {
          westraTransFile = `${pathToOutputDir}/Westra_trans.smr`;
        }
        if (parameters.smr_multi === OnOffOptions.ON) {
          westraMultiFile = `${pathToOutputDir}/Westra_multi.msmr`;
          westraMultiManhattanPlot = `${pathToOutputDir}/Westra_multi_manhattan.png`;
          westraMultiQQPlot = `${pathToOutputDir}/Westra_multi_qq.png`;
        }
      }

      let tissueSMRFile = null;
      let tissueSMRManhattanPlot = null;
      let tissueSMRQQPlot = null;
      let tissueTransFile = null;
      let tissueMultiFile = null;
      let tissueMultiManhattanPlot = null;
      let tissueMultiQQPlot = null;

      if (parameters.GTEx_v8_tissue) {
        tissueSMRFile = `${pathToOutputDir}/${parameters.GTEx_v8_tissue}.smr`;
        tissueSMRManhattanPlot = `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_manhattan.png`;
        tissueSMRQQPlot = `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_qq.png`;
        if (parameters.trans === OnOffOptions.ON) {
          tissueTransFile = `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_trans.smr`;
        }
        if (parameters.smr_multi === OnOffOptions.ON) {
          tissueMultiFile = `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_multi.msmr`;
          tissueMultiManhattanPlot = `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_multi_manhattan.png`;
          tissueMultiQQPlot = `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_multi_qq.png`;
        }
      }

      //update db with result files
      const finishedJob = await EqtlJobsModel.findByIdAndUpdate(
        job.data.jobId,
        {
          status: JobStatus.COMPLETED,
          cageSMRFile,
          cageSMRManhattanPlot,
          cageSMRQQPlot,
          cageTransFile,
          cageMultiFile,
          cageMultiManhattanPlot,
          cageMultiQQPlot,
          westraSMRFile,
          westraSMRManhattanPlot,
          westraSMRQQPlot,
          westraTransFile,
          westraMultiFile,
          westraMultiManhattanPlot,
          westraMultiQQPlot,
          tissueSMRFile,
          tissueSMRManhattanPlot,
          tissueSMRQQPlot,
          tissueTransFile,
          tissueMultiFile,
          tissueMultiManhattanPlot,
          tissueMultiQQPlot,
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
            link: `tools/${appConfig.appName}/result_view/${finishedJob._id}`,
          },
        });
      }
    });

    worker.on('failed', async (job: Job) => {
      console.log('worker ' + i + ' failed');
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
            link: `tools/${appConfig.appName}/result_view/${finishedJob._id}`,
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
