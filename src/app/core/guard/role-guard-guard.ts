// core/guards/role-guard-guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { inject } from '@angular/core';

export const roleGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);



  // اگر مسیر لاگین یا select-role باشه، اجازه بده
  if (state.url === '/login' || state.url === '/select-role') {
    return true;
  }

  // 1. اول بررسی کن که کاربر لاگین کرده
  if (!authService.isLoggedIn()) {

    router.navigate(['/login']);
    return false;
  }

  // 2. بررسی کن که کاربر نقش انتخاب کرده
  if (authService.hasSelectedRole()) {

    return true;
  }

  // 3. اگر نقش انتخاب نکرده، به صفحه انتخاب نقش برو

  router.navigate(['/select-role']);
  return false;
};