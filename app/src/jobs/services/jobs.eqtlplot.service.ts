import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEqtlPlotJobDto } from '../dto/create-eqtlplot-job.dto';
import { EqtlPlotJobsModel, JobStatus } from '../models/eqtlplot.jobs.model';
import { EqtlPlotModel } from '../models/eqtlplot.model';
import { UserDoc } from '../../auth/models/user.model';
import { GetJobsDto } from '../dto/getjobs.dto';
import {
  findAllJobs,
  removeManyUserJobs,
  removeUserJob,
  writeEqtlFile,
  deleteFileorFolder,
  fileSizeMb,
} from '@cubrepgwas/pgwascommon';
import { validateInputs } from './service.util';
import { EqtlPlotJobQueue } from '../../jobqueue/queue/eqtlplot.queue';

//production
const testPath =
  '/local/datasets/pgwas_test_files/eqtl/UKB_bv_height_SMR_0.05.txt';
//development
// const testPath = '/local/datasets/data/eqtl/UKB_small.txt';
// const testPath = '/local/datasets/data/eqtl/UKB_bv_height_SMR_0.05.txt';
@Injectable()
export class JobsEqtlPlotService {
  constructor(
    @Inject(EqtlPlotJobQueue)
    private jobQueue: EqtlPlotJobQueue,
  ) {}

  async create(
    createJobDto: CreateEqtlPlotJobDto,
    file: Express.Multer.File,
    user?: UserDoc,
  ) {
    const { jobUID } = await validateInputs(createJobDto, file, user);

    // console.log(createJobDto);
    console.log(jobUID);

    const session = await EqtlPlotJobsModel.startSession();
    const sessionTest = await EqtlPlotModel.startSession();
    session.startTransaction();
    sessionTest.startTransaction();

    try {
      // console.log('DTO: ', createJobDto);
      const opts = { session };
      const optsTest = { session: sessionTest };

      const filepath = createJobDto.useTest === 'true' ? testPath : file.path;

      //determine if it will be a long job
      const fileSize = await fileSizeMb(filepath);
      const longJob = fileSize > 0.5;

      //save job parameters, folder path, filename in database
      let newJob;

      if (user) {
        newJob = await EqtlPlotJobsModel.build({
          job_name: createJobDto.job_name,
          jobUID,
          inputFile: filepath,
          status: JobStatus.QUEUED,
          user: user.id,
          longJob,
        });
      }

      if (createJobDto.email) {
        newJob = await EqtlPlotJobsModel.build({
          job_name: createJobDto.job_name,
          jobUID,
          inputFile: filepath,
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
      const eqtlplot = await EqtlPlotModel.build({
        ...createJobDto,
        job: newJob.id,
      });

      await eqtlplot.save(optsTest);
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
    return await findAllJobs(getJobsDto, user, EqtlPlotJobsModel);
  }

  async getJobByID(id: string, user: UserDoc) {
    const job = await EqtlPlotJobsModel.findById(id)
      .populate('eqtlplot_params')
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
    const job = await EqtlPlotJobsModel.findById(id)
      .populate('eqtlplot_params')
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
    return await removeManyUserJobs(user, EqtlPlotJobsModel);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
