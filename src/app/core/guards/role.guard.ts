import { inject } from '@angular/core';
import { Router, type ActivatedRouteSnapshot, type CanActivateFn } from '@angular/router';
import type { UserRole } from '../../models/database.types';
import { AuthService } from '../auth.service';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot) => {
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
  if (!role) {
    return router.parseUrl('/login');
  }

  const expectedRole = route.data['role'] as UserRole | undefined;
  if (!expectedRole) {
    return true;
  }

  if (role === expectedRole) {
    return true;
  }

  return router.parseUrl(auth.dashboardPathForRole(role));
};
