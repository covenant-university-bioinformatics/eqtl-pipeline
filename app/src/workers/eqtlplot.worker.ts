import { SandboxedJob } from 'bullmq';
import * as fs from 'fs';
import { spawnSync } from 'child_process';
import connectDB, { closeDB } from '../mongoose';
import appConfig from '../config/app.config';
import {
  deleteFileorFolder,
  fileOrPathExists,
  writeEqtlFile,
} from '@cubrepgwas/pgwascommon';
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

  //create input file and folder
  let filename;

  //extract file name
  const name = jobParams.inputFile.split(/(\\|\/)/g).pop();

  if (parameters.useTest === false) {
    filename = `/pv/analysis/${jobParams.jobUID}/input/${name}`;
  } else {
    filename = `/pv/analysis/${jobParams.jobUID}/input/test.txt`;
  }

  //write the exact columns needed by the analysis
  writeEqtlFile(jobParams.inputFile, filename, {
    marker_name: parameters.marker_name - 1,
    effect_allele: parameters.effect_allele - 1,
    alternate_allele: parameters.alternate_allele - 1,
    effect_allele_freq: parameters.effect_allele_freq - 1,
    beta: parameters.beta - 1,
    se: parameters.se - 1,
    p: parameters.p_value - 1,
    n: parameters.sample_size - 1,
  });

  if (parameters.useTest === false) {
    deleteFileorFolder(jobParams.inputFile).then(() => {
      // console.log('deleted');
    });
  }

  //assemble job parameters
  const pathToInputFile = filename;
  const pathToOutputDir = `/pv/analysis/${job.data.jobUID}/${appConfig.appNamePlot}/output`;
  const jobParameters = getJobParameters(parameters);
  jobParameters.unshift(pathToInputFile, pathToOutputDir);

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
  await sleep(3000);
  //spawn process
  const jobSpawn = spawnSync(
    // './pipeline_scripts/pascal.sh &>/dev/null',
    './pipeline_scripts/smr_plot.sh',
    jobParameters,
    { maxBuffer: 1024 * 1024 * 1024 },
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
