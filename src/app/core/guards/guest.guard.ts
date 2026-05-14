import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';

/** Redirect authenticated users away from login/register toward the correct dashboard. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.initializing;
  if (!(await auth.hasSession())) return true;
  if (!auth.profileSignal()) {
    await auth.refreshProfile();
  }
  const role = auth.profileSignal()?.role;
  if (!role) {
    // If we have a session but no profile yet, it might be loading or 
    // the user just confirmed their email. Don't redirect or sign out yet.
    return true;
  }
  return router.parseUrl(auth.dashboardPathForRole(role));
};
