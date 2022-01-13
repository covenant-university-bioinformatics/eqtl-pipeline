import { Module, OnModuleInit } from '@nestjs/common';

import { JobsModule } from './jobs/jobs.module';
import { QueueModule } from './jobqueue/queue.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, JobsModule, QueueModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
