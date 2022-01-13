import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';
import { User, UserDoc } from './models/user.model';

//ExtractJwt.fromAuthHeaderAsBearerToken()

//This file handles the extraction of jwt token from cookie or header and
//Validating the jwt token

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['accessToken'];
  }
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private logger: Logger;
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_KEY,
    });
    this.logger = new Logger();
  }

  async validate(payload: JwtPayload): Promise<UserDoc> {
    const { username } = payload;
    const user = await User.findOne({ username }).exec();

    if (!user) {
      this.logger.error(`Username not found: ${username}`);
      throw new UnauthorizedException();
    }

    return user;
  }
}
