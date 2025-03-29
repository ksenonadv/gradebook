import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces/user.interface';

export const teacherGuard: CanActivateFn = () => {
  
  const authService = inject(AuthService);

  if (!authService.isLoggedIn)
    return false;

  if (authService.getUserData()?.role != UserRole.Teacher)
    return false;

  return true;
};
