import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { AdminGuard } from './admin.guard.js';

function createContext(role: string): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user: { role } }),
    }),
  } as ExecutionContext;
}

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  it('allows administrators', () => {
    expect(guard.canActivate(createContext('ADMIN'))).toBe(true);
  });

  it('rejects regular users', () => {
    expect(() => guard.canActivate(createContext('USER'))).toThrow(
      ForbiddenException,
    );
  });

  it('rejects requests without an authenticated user', () => {
    const context = {
      switchToHttp: () => ({ getRequest: () => ({}) }),
    } as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
