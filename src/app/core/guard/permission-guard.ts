// core/guards/permission-guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const permissionGuard = (requiredPermission: string): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    if (!authService.hasSelectedRole()) {
      router.navigate(['/select-role']);
      return false;
    }

    const permissions = authService.getUserPermissions();
    
    // اگر دسترسی‌ها خالی است، اجازه دسترسی نده
    if (!permissions || permissions.length === 0) {
      router.navigate(['/dashboard']);
            return false;
    }

    if (authService.hasPermission(requiredPermission)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};