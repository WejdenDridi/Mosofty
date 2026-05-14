import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';

export const managerGuard: CanActivateFn = async () => {
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
  if (role === 'manager') return true;
  if (role === 'employee') {
    return router.parseUrl('/employee-dashboard/dashboard');
  }
  return router.parseUrl('/login');
};
