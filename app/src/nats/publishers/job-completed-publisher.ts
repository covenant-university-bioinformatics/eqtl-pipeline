import { Publisher } from './base-publisher';
import { Subjects } from '@cubrepgwas/pgwascommon';
import { JobCompletedEvent } from '@cubrepgwas/pgwascommon';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JobCompletedPublisher extends Publisher<JobCompletedEvent> {
  subject: Subjects.EmailNotify = Subjects.EmailNotify;
}
