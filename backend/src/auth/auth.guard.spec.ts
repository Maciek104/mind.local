import { AuthGuard } from './auth.guard.js';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { DatabaseService } from '../database/database.service.js';

describe('AuthGuard', () => {
  function createContext(cookies: Record<string, string> = {}) {
    return {
      getHandler: vi.fn(),
      getClass: vi.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ cookies }),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows public routes without a session', async () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const guard = new AuthGuard(
      reflector,
      {} as JwtService,
      {} as DatabaseService,
    );

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
  });

  it('rejects protected routes without a session', async () => {
    const reflector = new Reflector();
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const guard = new AuthGuard(
      reflector,
      {} as JwtService,
      {} as DatabaseService,
    );

    await expect(guard.canActivate(createContext())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
