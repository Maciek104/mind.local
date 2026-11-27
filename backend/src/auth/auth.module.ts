
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from './auth.guard.js';

import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [
    DatabaseModule,

    JwtModule.registerAsync({
      useFactory: () => {
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
          throw new Error(
            'JWT_SECRET is missing. Could not load the configuration.',
          );
        }

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: 7 * 24 * 60 * 60,
          },
        };
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    AuthGuard,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],

  exports: [
    AuthService,
    AuthGuard,
  ],
})
export class AuthModule {}
