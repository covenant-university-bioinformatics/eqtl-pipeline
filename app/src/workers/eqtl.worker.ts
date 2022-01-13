import { SandboxedJob } from 'bullmq';
import * as fs from 'fs';
import { EqtlJobsModel, JobStatus } from '../jobs/models/eqtl.jobs.model';
import { EqtlDoc, EqtlModel, OnOffOptions } from '../jobs/models/eqtl.model';
import appConfig from '../config/app.config';
import { spawnSync } from 'child_process';
import connectDB, { closeDB } from '../mongoose';

import { fileOrPathExists } from '@cubrepgwas/pgwascommon';

function sleep(ms) {
  console.log('sleeping');
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJobParameters(parameters: EqtlDoc) {
  return [
    String(parameters.population),
    String(parameters.heidi),
    String(parameters.trans),
    String(parameters.smr_multi),
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
    String(parameters.trans_wind),
    String(parameters.set_wind),
    String(parameters.ld_multi_snp),
    String(parameters.Westra_eqtl),
    String(parameters.CAGE_eqtl),
    String(parameters.GTEx_v8_tissue),
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
  const parameters = await EqtlModel.findOne({
    job: job.data.jobId,
  }).exec();
  const jobParams = await EqtlJobsModel.findById(job.data.jobId).exec();

  //assemble job parameters
  const pathToInputFile = `${jobParams.inputFile}`;
  const pathToOutputDir = `/pv/analysis/${job.data.jobUID}/${appConfig.appName}/output`;
  const jobParameters = getJobParameters(parameters);
  jobParameters.unshift(pathToInputFile, pathToOutputDir);
  // console.log(jobParameters);
  console.log(jobParameters);
  //make output directory
  fs.mkdirSync(pathToOutputDir, { recursive: true });

  // save in mongo database
  await EqtlJobsModel.findByIdAndUpdate(
    job.data.jobId,
    {
      status: JobStatus.RUNNING,
    },
    { new: true },
  );

  //spawn process
  const jobSpawn = spawnSync(
    // './pipeline_scripts/pascal.sh &>/dev/null',
    './pipeline_scripts/smr.sh',
    jobParameters,
    { maxBuffer: 1024 * 1024 * 10 },
  );

  console.log('Spawn command log');
  console.log(jobSpawn?.stdout?.toString());
  console.log('=====================================');
  console.log('Spawn error log');
  const error_msg = jobSpawn?.stderr?.toString();
  console.log(error_msg);

  let cageSMR = false;
  let cageSMRManhattan = false;
  let cageSMRQQ = false;
  let cageSMRTrans = false;
  let cageSMRMulti = false;
  let cageSMRMultiManhattan = false;
  let cageSMRMultiQQ = false;

  if (parameters.CAGE_eqtl === 'true') {
    cageSMR = await fileOrPathExists(`${pathToOutputDir}/CAGE.smr`);
    cageSMRManhattan = await fileOrPathExists(
      `${pathToOutputDir}/CAGE_manhattan.png`,
    );
    cageSMRQQ = await fileOrPathExists(`${pathToOutputDir}/CAGE_qq.png`);
    if (parameters.trans === OnOffOptions.ON) {
      cageSMRTrans = await fileOrPathExists(
        `${pathToOutputDir}/CAGE_trans.smr`,
      );
    }
    if (parameters.smr_multi === OnOffOptions.ON) {
      cageSMRMulti = await fileOrPathExists(
        `${pathToOutputDir}/CAGE_multi.msmr`,
      );
      cageSMRMultiManhattan = await fileOrPathExists(
        `${pathToOutputDir}/CAGE_multi_manhattan.png`,
      );
      cageSMRMultiQQ = await fileOrPathExists(
        `${pathToOutputDir}/CAGE_multi_qq.png`,
      );
    }
  }

  let westraSMR = false;
  let westraSMRManhattan = false;
  let westraSMRQQ = false;
  let westraSMRTrans = false;
  let westraSMRMulti = false;
  let westraSMRMultiManhattan = false;
  let westraSMRMultiQQ = false;

  if (parameters.Westra_eqtl === 'true') {
    westraSMR = await fileOrPathExists(`${pathToOutputDir}/Westra.smr`);
    westraSMRManhattan = await fileOrPathExists(
      `${pathToOutputDir}/Westra_manhattan.png`,
    );
    westraSMRQQ = await fileOrPathExists(`${pathToOutputDir}/Westra_qq.png`);
    if (parameters.trans === OnOffOptions.ON) {
      westraSMRTrans = await fileOrPathExists(
        `${pathToOutputDir}/Westra_trans.smr`,
      );
    }
    if (parameters.smr_multi === OnOffOptions.ON) {
      westraSMRMulti = await fileOrPathExists(
        `${pathToOutputDir}/Westra_multi.msmr`,
      );
      westraSMRMultiManhattan = await fileOrPathExists(
        `${pathToOutputDir}/Westra_multi_manhattan.png`,
      );
      westraSMRMultiQQ = await fileOrPathExists(
        `${pathToOutputDir}/Westra_multi_qq.png`,
      );
    }
  }

  let tissueSMR = false;
  let tissueSMRManhattan = false;
  let tissueSMRQQ = false;
  let tissueSMRTrans = false;
  let tissueSMRMulti = false;
  let tissueSMRMultiManhattan = false;
  let tissueSMRMultiQQ = false;

  if (parameters.GTEx_v8_tissue) {
    tissueSMR = await fileOrPathExists(
      `${pathToOutputDir}/${parameters.GTEx_v8_tissue}.smr`,
    );
    tissueSMRManhattan = await fileOrPathExists(
      `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_manhattan.png`,
    );
    tissueSMRQQ = await fileOrPathExists(
      `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_qq.png`,
    );
    if (parameters.trans === OnOffOptions.ON) {
      tissueSMRTrans = await fileOrPathExists(
        `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_trans.smr`,
      );
    }
    if (parameters.smr_multi === OnOffOptions.ON) {
      tissueSMRMulti = await fileOrPathExists(
        `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_multi.msmr`,
      );
      tissueSMRMultiManhattan = await fileOrPathExists(
        `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_multi_manhattan.png`,
      );
      tissueSMRMultiQQ = await fileOrPathExists(
        `${pathToOutputDir}/${parameters.GTEx_v8_tissue}_multi_qq.png`,
      );
    }
  }

  const resultSuccessful = [
    cageSMR,
    cageSMRManhattan,
    cageSMRQQ,
    cageSMRTrans,
    cageSMRMulti,
    cageSMRMultiManhattan,
    cageSMRMultiQQ,
    westraSMR,
    westraSMRManhattan,
    westraSMRQQ,
    westraSMRTrans,
    westraSMRMulti,
    westraSMRMultiManhattan,
    westraSMRMultiQQ,
    tissueSMR,
    tissueSMRManhattan,
    tissueSMRQQ,
    tissueSMRTrans,
    tissueSMRMulti,
    tissueSMRMultiManhattan,
    tissueSMRMultiQQ,
  ];

  const answer = resultSuccessful.some((element) => element === false);

  //close database connection
  closeDB();

  if (answer) {
    throw new Error(error_msg || 'Job failed to successfully complete');
  } else {
    return true;
  }

  return true;
};
