import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces/user.interface';
import { CourseService } from '../services/course.service';

export const teacherGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  
  const authService = inject(AuthService);
  const courseService = inject(CourseService);
  const router = inject(Router);
  
  if (!authService.isLoggedIn) {
    return false;
  }

  if (authService.getUserData()?.role !== UserRole.Teacher) {
    return false;
  }
  
  const id = parseInt(route.paramMap.get('id')!);

  if (!id) {
    router.navigate(['/courses']);
    return false;
  }

  return courseService.getCourse(id).then((course) => {
    if (course.teacher.email !== authService.getUserData()?.email) {
      router.navigate(['/courses']);
      return false;
    }

    return true;
  }).catch(() => {
    router.navigate(['/courses']);
    return false;
  });
};
