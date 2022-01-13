import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../models/user.model';
import {
  NewUserDto,
  register,
  updateUser,
  userEmailConfirmedChange,
  removeUser,
} from '@cubrepgwas/pgwascommon';
import { UserUpdatedDto } from '@cubrepgwas/pgwascommon';
import { UserDeletedDto } from '@cubrepgwas/pgwascommon';

@Injectable()
export class AuthService {
  constructor() {}

  async register(newUserDto: NewUserDto): Promise<{ success: boolean }> {
    return await register(newUserDto, User);
  }

  async findAll() {
    return User.find();
  }

  async findOne(id: string) {
    const user = await User.findOne({ _id: id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(userUpdatedDto: UserUpdatedDto) {
    return await updateUser(userUpdatedDto, User);
  }

  async emailConfirmChange(emailConfirmChange: {
    username: string;
    email: string;
    emailConfirmed: boolean;
  }) {
    return await userEmailConfirmedChange(emailConfirmChange, User);
  }

  async remove(userDeleteDto: UserDeletedDto) {
    return await removeUser(userDeleteDto, User);
  }
}
