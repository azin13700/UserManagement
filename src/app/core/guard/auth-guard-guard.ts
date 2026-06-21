import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ اگر لاگین است و نقش دارد، به dashboard برو
  if (authService.isLoggedIn() && authService.hasSelectedRole()) {
    router.navigate(['/dashboard']);
    return false;
  }

  if (authService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
