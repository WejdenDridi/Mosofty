import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../auth.service';

/** Requires an authenticated Supabase session. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.initializing;
  if (await auth.hasSession()) {
    if (!auth.profileSignal()) {
      await auth.refreshProfile();
    }
    if (!auth.profileSignal()) {
      return router.parseUrl('/login');
    }
    return true;
  }
  return router.parseUrl('/login');
};
