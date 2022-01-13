import { SandboxedJob } from 'bullmq';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import connectDB, { closeDB } from '../mongoose';
import appConfig from '../config/app.config';
import { fileOrPathExists } from '@cubrepgwas/pgwascommon';
import { EqtlPlotDoc, EqtlPlotModel } from '../jobs/models/eqtlplot.model';
import {
  EqtlPlotJobsModel,
  JobStatus,
} from '../jobs/models/eqtlplot.jobs.model';

function sleep(ms) {
  console.log('sleeping');
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJobParameters(parameters: EqtlPlotDoc) {
  return [
    String(parameters.population),
    String(parameters.eqtl_summary),
    String(parameters.probe),
    String(parameters.probe_wind),
    String(parameters.gene_list),
    String(parameters.maf),
    String(parameters.diff_freq),
    String(parameters.diff_freq_prop),
    String(parameters.cis_wind),
    String(parameters.peqtl_smr),
    String(parameters.ld_upper_limit),
    String(parameters.ld_lower_limit),
    String(parameters.peqtl_heidi),
    String(parameters.heidi_mtd),
    String(parameters.heidi_min_m),
    String(parameters.heidi_max_m),
    String(parameters.smr_thresh),
    String(parameters.heidi_thresh),
    String(parameters.plotWindow),
    String(parameters.max_anno_probe),
  ];
}

export default async (job: SandboxedJob) => {
  //executed for each job
  console.log(
    'Worker ' +
      ' processing job ' +
      JSON.stringify(job.data.jobId) +
      ' Job name: ' +
      JSON.stringify(job.data.jobName),
  );

  await connectDB();
  await sleep(2000);

  //fetch job parameters from database
  const parameters = await EqtlPlotModel.findOne({
    job: job.data.jobId,
  }).exec();
  const jobParams = await EqtlPlotJobsModel.findById(job.data.jobId).exec();

  //assemble job parameters
  const pathToInputFile = `${jobParams.inputFile}`;
  const pathToOutputDir = `/pv/analysis/${job.data.jobUID}/${appConfig.appNamePlot}/output`;
  const jobParameters = getJobParameters(parameters);
  jobParameters.unshift(pathToInputFile, pathToOutputDir);
  // console.log(jobParameters);
  console.log(jobParameters);
  //make output directory
  fs.mkdirSync(pathToOutputDir, { recursive: true });

  // save in mongo database
  await EqtlPlotJobsModel.findByIdAndUpdate(
    job.data.jobId,
    {
      status: JobStatus.RUNNING,
    },
    { new: true },
  );

  //spawn process
  const jobSpawn = spawnSync(
    // './pipeline_scripts/pascal.sh &>/dev/null',
    './pipeline_scripts/smr_plot.sh',
    jobParameters,
    { maxBuffer: 1024 * 1024 * 10 },
  );

  console.log('Spawn command log');
  console.log(jobSpawn?.stdout?.toString());
  console.log('=====================================');
  console.log('Spawn error log');
  const error_msg = jobSpawn?.stderr?.toString();
  console.log(error_msg);

  let EffectSizePlot = await fileOrPathExists(
    `${pathToOutputDir}/Effect_sizes.png`,
  );
  let LocusPlot = await fileOrPathExists(`${pathToOutputDir}/LocusPlot.png`);

  //close database connection
  closeDB();

  if (EffectSizePlot && LocusPlot) {
    return true;
  } else {
    throw new Error(error_msg || 'Job failed to successfully complete');
  }

  return true;
};
