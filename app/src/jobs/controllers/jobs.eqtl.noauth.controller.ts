import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import * as multer from 'multer';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { JobsEqtlService } from '../services/jobs.eqtl.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { getFileOutput } from '@cubrepgwas/pgwascommon';
import { GetUser } from '../../decorators/get-user.decorator';

const storageOpts = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('/local/datasets/temporary')) {
      fs.mkdirSync('/local/datasets/temporary', { recursive: true });
    }
    cb(null, '/local/datasets/temporary'); //destination
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '__' + file.originalname);
  },
});

@Controller('api/eqtl/noauth/jobs')
export class JobsEqtlNoAuthController {
  constructor(private readonly jobsService: JobsEqtlService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: storageOpts }))
  async create(
    @Body(ValidationPipe) createJobDto: CreateJobDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    //call service
    return await this.jobsService.create(createJobDto, file);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @GetUser() user) {
    const job = await this.jobsService.getJobByIDNoAuth(id);

    job.user = null;
    return job;
  }

  @Get('/output/:id/:file') //file is the name saved in the database
  async getOutput(
    @Param('id') id: string,
    @Param('file') file_key: string,
    @GetUser() user,
  ) {
    const job = await this.jobsService.getJobByIDNoAuth(id);
    return getFileOutput(id, file_key, job);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @GetUser() user) {
    return this.jobsService.removeJobNoAuth(id);
  }
}
