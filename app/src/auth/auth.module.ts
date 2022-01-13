import { Global, Inject, Module, OnModuleInit } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { NatsModule } from '../nats/nats.module';
import { UserApprovedListener } from 'src/nats/listeners/user-approved-listener';
import { UserUpdatedListener } from '../nats/listeners/user-updated-listener';
import { UserDeletedListener } from '../nats/listeners/user-delete-listener';
import { UserEmailConfirmChangeListener } from '../nats/listeners/user-email-confirm-change-listener';

@Global()
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: process.env.JWT_KEY,
      signOptions: {
        expiresIn: 60 * 60 * 24 * 7,
      },
    }),
    NatsModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, AuthService],
})
export class AuthModule implements OnModuleInit {
  @Inject(UserApprovedListener)
  private userApprovedListener: UserApprovedListener;
  @Inject(UserUpdatedListener)
  private userUpdatedListener: UserUpdatedListener;
  @Inject(UserDeletedListener)
  private userDeletedListener: UserDeletedListener;
  @Inject(UserEmailConfirmChangeListener)
  private userEmailConfirmChangeListener: UserEmailConfirmChangeListener;

  onModuleInit() {
    console.log(`The Auth module has been initialized`);
    // await connectDB();
    this.userDeletedListener.listen();
    this.userUpdatedListener.listen();
    this.userApprovedListener.listen();
    this.userEmailConfirmChangeListener.listen();
  }
}
