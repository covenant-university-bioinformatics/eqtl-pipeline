import { Global, Module } from '@nestjs/common';
import { JobsEqtlService } from './services/jobs.eqtl.service';
import { JobsEqtlController } from './controllers/jobs.eqtl.controller';
import { QueueModule } from '../jobqueue/queue.module';
import { JobsEqtlNoAuthController } from './controllers/jobs.eqtl.noauth.controller';
import { JobsEqtlPlotController } from './controllers/jobs.eqtlplot.controller';
import { JobsEqtlPlotNoAuthController } from './controllers/jobs.eqtlplot.noauth.controller';
import { JobsEqtlPlotService } from './services/jobs.eqtlplot.service';

@Global()
@Module({
  imports: [QueueModule],
  controllers: [
    JobsEqtlController,
    JobsEqtlNoAuthController,
    JobsEqtlPlotController,
    JobsEqtlPlotNoAuthController,
  ],
  providers: [JobsEqtlService, JobsEqtlPlotService],
  exports: [],
})
export class JobsModule {}
