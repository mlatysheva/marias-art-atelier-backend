import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from '../token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies.Authentication,
      ]),
      // secretOrKey: configService.getOrThrow('JWT_SECRET'),
      secretOrKey: 'Acnx7H76Q7rjmFgTk8XnlWg86tb3aZNK',
    });
  }

  validate(payload: TokenPayload) {
    console.log('payload', payload);
    return payload;
  }
}
