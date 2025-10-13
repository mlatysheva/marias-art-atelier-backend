import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import ms from 'ms';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './token-payload.interface';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

interface SignedToken {
  token: string;
  expiresAt: Date;
}

interface AuthTokens {
  access: SignedToken;
  refresh: SignedToken;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  login(user: User, response: Response) {
    const tokens = this.getAuthTokens(user.id);
    this.attachTokensToResponse(tokens, response);

    return {
      tokenPayload: { userId: user.id },
      accessToken: tokens.access.token,
      accessTokenExpiresAt: tokens.access.expiresAt.toISOString(),
      refreshToken: tokens.refresh.token,
      refreshTokenExpiresAt: tokens.refresh.expiresAt.toISOString(),
    };
  }

  async verifyUser(email: string, password: string) {
    try {
      const user = await this.usersService.getUser({ email });
      const authenticated = await bcrypt.compare(password, user.password);
      if (!authenticated) {
        throw new UnauthorizedException('Credentials are not valid.');
      }
      return user;
    } catch {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  verifyToken(jwt: string) {
    this.jwtService.verify(jwt, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
    });
  }

  async refreshTokens(refreshToken: string, response: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing.');
    }

    try {
      const { userId } = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      });

      // Ensure the user still exists
      const user = await this.usersService.getUser({ id: userId });
      if (!user) {
        throw new UnauthorizedException('User no longer exists.');
      }

      const tokens = this.getAuthTokens(userId);
      this.attachTokensToResponse(tokens, response);

      return {
        accessToken: tokens.access.token,
        accessTokenExpiresAt: tokens.access.expiresAt.toISOString(),
        refreshToken: tokens.refresh.token,
        refreshTokenExpiresAt: tokens.refresh.expiresAt.toISOString(),
      };
    } catch {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }
  }

  private getAuthTokens(userId: string): AuthTokens {
    const payload: TokenPayload = { userId };

    const access = this.signToken(
      payload,
      this.configService.getOrThrow('JWT_SECRET'),
      this.configService.get<string>('JWT_EXPIRATION') || '10h',
    );

    const refresh = this.signToken(
      payload,
      this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d',
    );

    return { access, refresh };
  }

  private signToken(
    payload: TokenPayload,
    secret: string,
    expiresIn: string,
  ): SignedToken {
    const expiresAt = this.getExpirationDate(expiresIn);
    const token = this.jwtService.sign(payload, { secret, expiresIn });

    return { token, expiresAt };
  }

  private getExpirationDate(expiration: string) {
    const expirationMs = ms(expiration as unknown as ms.StringValue);
    return new Date(Date.now() + expirationMs);
  }

  private attachTokensToResponse(tokens: AuthTokens, response: Response) {
    const secure = this.configService.get('NODE_ENV') === 'production';
    const sameSite = secure ? 'strict' : 'lax';

    response.cookie('Authentication', tokens.access.token, {
      secure,
      httpOnly: true,
      sameSite,
      path: '/',
      expires: tokens.access.expiresAt,
    });

    response.cookie('Refresh', tokens.refresh.token, {
      secure,
      httpOnly: true,
      sameSite,
      path: '/',
      expires: tokens.refresh.expiresAt,
    });
  }
}
