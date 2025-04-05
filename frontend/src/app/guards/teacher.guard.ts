import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../interfaces/user.interface';
import { CourseService } from '../services/course.service';
import { Observable, of } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

export const teacherGuard: CanActivateFn = (route: ActivatedRouteSnapshot): Observable<boolean> => {
  const authService = inject(AuthService);
  const courseService = inject(CourseService);
  const router = inject(Router);

  return authService.userData$.pipe(
    take(1),
    switchMap(userData => {
      const id = parseInt(route.paramMap.get('id')!);
      if (!id) {
        router.navigate(['/courses']);
        return of(false);
      }

      if (!userData || userData.role !== UserRole.Teacher) {
        router.navigate(['/courses', id]);
        return of(false);
      }

      return courseService.getCourse(id).then((course) => {
        if (course.teacher.email !== userData.email) {
          router.navigate(['/courses']);
          return false;
        }
        return true;
      }).catch(() => {
        router.navigate(['/courses']);
        return false;
      });
    })
  );
};
