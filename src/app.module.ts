import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PaintingsModule } from './paintings/paintings.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { CheckoutModule } from './checkout/checkout.module';
import { HealthController } from './health.controller';
import { DescriptionAiModule } from './openAi/descriptionAi.module';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            transport: isProduction
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                  },
                },
            level: isProduction ? 'info' : 'debug',
          },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    UsersModule,
    AuthModule,
    PaintingsModule,
    CheckoutModule,
    DescriptionAiModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
