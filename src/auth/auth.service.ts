import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import ms from 'ms';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  login(user: User, response: Response) {
    const expires = new Date();
    const jwtExpiration =
      this.configService.get<string>('JWT_EXPIRATION') || '10h';
    const expirationMs = ms(jwtExpiration as unknown as ms.StringValue);

    expires.setMilliseconds(
      parseInt(expires.getMilliseconds() + ms(expirationMs)),
    );

    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      secure: true,
      httpOnly: true,
      expires,
    });

    return { tokenPayload };
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({ email });
      const authenticated = await bcrypt.compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException('Credentials are not valid.');
      }
      return user;
    } catch (error) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }
}
