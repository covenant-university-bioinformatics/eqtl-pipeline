import { Message } from 'node-nats-streaming';
import { Listener } from './base-listener';
import { Subjects } from '@cubrepgwas/pgwascommon';
import { Inject, Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/services/auth.service';
import { UserDeletedEvent } from '@cubrepgwas/pgwascommon';

@Injectable()
export class UserDeletedListener extends Listener<UserDeletedEvent> {
  queueGroupName = 'eqtl-smr-jobs-service';
  readonly subject: Subjects.UserDeleted = Subjects.UserDeleted;

  @Inject(AuthService)
  private authService: AuthService;
  async onMessage(data: UserDeletedEvent['data'], msg: Message): Promise<void> {
    // console.log('Jobs Event data!', data);

    const result = await this.authService.remove(data);
    if (result.success) {
      console.log('user deleted');
      msg.ack();
    }
  }
}
