import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { CreateJobDto } from '../dto/create-job.dto';
import { EqtlJobsModel, JobStatus } from '../models/eqtl.jobs.model';
import { EqtlModel, OnOffOptions } from '../models/eqtl.model';
import { EqtlJobQueue } from '../../jobqueue/queue/eqtl.queue';
import { UserDoc } from '../../auth/models/user.model';
import { GetJobsDto } from '../dto/getjobs.dto';
import {
  fileOrPathExists,
  findAllJobs,
  removeManyUserJobs,
  removeUserJob,
  writeEqtlFile,
  deleteFileorFolder,
} from '@cubrepgwas/pgwascommon';
import { validateInputs } from './service.util';

//production
const testPath = '/local/datasets/pgwas_test_files/pascal/uk_split.txt';
//development
// const testPath = '/local/datasets/data/pascal/uk_split.txt';

@Injectable()
export class JobsEqtlService {
  constructor(
    @Inject(EqtlJobQueue)
    private jobQueue: EqtlJobQueue,
  ) {}

  async create(
    createJobDto: CreateJobDto,
    file: Express.Multer.File,
    user?: UserDoc,
  ) {
    const { jobUID, filename } = await validateInputs(createJobDto, file, user);

    // console.log(createJobDto);
    console.log(jobUID);

    const session = await EqtlJobsModel.startSession();
    const sessionTest = await EqtlModel.startSession();
    session.startTransaction();
    sessionTest.startTransaction();

    try {
      // console.log('DTO: ', createJobDto);
      const opts = { session };
      const optsTest = { session: sessionTest };

      const filepath = createJobDto.useTest === 'true' ? testPath : file.path;

      //write the exact columns needed by the analysis
      const totalLines = writeEqtlFile(filepath, filename, {
        marker_name: parseInt(createJobDto.marker_name, 10) - 1,
        effect_allele: parseInt(createJobDto.effect_allele, 10) - 1,
        alternate_allele: parseInt(createJobDto.alternate_allele, 10) - 1,
        effect_allele_freq: parseInt(createJobDto.effect_allele_freq, 10) - 1,
        beta: parseInt(createJobDto.beta, 10) - 1,
        se: parseInt(createJobDto.se, 10) - 1,
        p: parseInt(createJobDto.p_value, 10) - 1,
        n: parseInt(createJobDto.sample_size, 10) - 1,
      });

      if (createJobDto.useTest === 'false') {
        deleteFileorFolder(file.path).then(() => {
          console.log('deleted');
        });
      }

      //determine if it will be a long job
      const heidi = createJobDto.heidi === OnOffOptions.ON;
      const trans = createJobDto.trans === OnOffOptions.ON;
      const smr_multi = createJobDto.smr_multi === OnOffOptions.ON;
      const longJob = totalLines > 100000 || (heidi && trans) || smr_multi;

      //save job parameters, folder path, filename in database
      let newJob;

      if (user) {
        newJob = await EqtlJobsModel.build({
          job_name: createJobDto.job_name,
          jobUID,
          inputFile: filename,
          status: JobStatus.QUEUED,
          user: user.id,
          longJob,
        });
      }

      if (createJobDto.email) {
        newJob = await EqtlJobsModel.build({
          job_name: createJobDto.job_name,
          jobUID,
          inputFile: filename,
          status: JobStatus.QUEUED,
          email: createJobDto.email,
          longJob,
        });
      }

      if (!newJob) {
        throw new BadRequestException(
          'Job cannot be null, check job parameters',
        );
      }

      //let the models be created per specific analysis
      const eqtl = await EqtlModel.build({
        ...createJobDto,
        job: newJob.id,
      });

      await eqtl.save(optsTest);
      await newJob.save(opts);

      //add job to queue
      if (user) {
        await this.jobQueue.addJob({
          jobId: newJob.id,
          jobName: newJob.job_name,
          jobUID: newJob.jobUID,
          username: user.username,
          email: user.email,
          noAuth: false,
        });
      }

      if (createJobDto.email) {
        await this.jobQueue.addJob({
          jobId: newJob.id,
          jobName: newJob.job_name,
          jobUID: newJob.jobUID,
          username: 'User',
          email: createJobDto.email,
          noAuth: true,
        });
      }

      await session.commitTransaction();
      await sessionTest.commitTransaction();
      return {
        success: true,
        jobId: newJob.id,
      };
    } catch (e) {
      if (e.code === 11000) {
        throw new ConflictException('Duplicate job name not allowed');
      }
      await session.abortTransaction();
      await sessionTest.abortTransaction();
      deleteFileorFolder(`/pv/analysis/${jobUID}`).then(() => {
        // console.log('deleted');
      });
      throw new BadRequestException(e.message);
    } finally {
      session.endSession();
      sessionTest.endSession();
    }
  }

  async findAll(getJobsDto: GetJobsDto, user: UserDoc) {
    return await findAllJobs(getJobsDto, user, EqtlJobsModel);
  }

  async getJobByID(id: string, user: UserDoc) {
    const job = await EqtlJobsModel.findById(id)
      .populate('eqtl_params')
      .populate('user')
      .exec();

    if (!job) {
      throw new NotFoundException();
    }

    if (job?.user?.username !== user.username) {
      throw new ForbiddenException('Access not allowed');
    }

    return job;
  }

  async getJobByIDNoAuth(id: string) {
    const job = await EqtlJobsModel.findById(id)
      .populate('eqtl_params')
      .populate('user')
      .exec();

    if (!job) {
      throw new NotFoundException();
    }

    if (job?.user?.username) {
      throw new ForbiddenException('Access not allowed');
    }

    return job;
  }

  async removeJob(id: string, user: UserDoc) {
    const job = await this.getJobByID(id, user);

    return await removeUserJob(id, job);
  }

  async removeJobNoAuth(id: string) {
    const job = await this.getJobByIDNoAuth(id);

    return await removeUserJob(id, job);
  }

  async deleteManyJobs(user: UserDoc) {
    return await removeManyUserJobs(user, EqtlJobsModel);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
