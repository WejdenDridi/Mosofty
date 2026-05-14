import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';

export const employeeGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.initializing;
  if (!(await auth.hasSession())) {
    return router.parseUrl('/login');
  }
  if (!auth.profileSignal()) {
    await auth.refreshProfile();
  }
  const role = auth.profileSignal()?.role;
  if (role === 'employee') return true;
  if (role === 'manager') {
    return router.parseUrl('/manager-dashboard');
  }
  return router.parseUrl('/login');
};
