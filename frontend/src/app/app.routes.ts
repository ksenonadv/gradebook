import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmailConfirmationComponent } from './components/email-confirmation/email-confirmation.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { CoursesComponent } from './components/courses/courses.component';
import { CourseComponent } from './components/course/course.component';
import { GradeMultipleStudentsComponent } from './components/grade-multiple-students/grade-multiple-students.component';
import { teacherGuard } from './guards/teacher.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'courses',
    component: CoursesComponent,
    canActivate: [authGuard],
  },
  {
    path: 'course/:id',
    component: CourseComponent,
    canActivate: [authGuard],
  },
  {
    path: 'course/:id/grade-multiple',
    component: GradeMultipleStudentsComponent,
    canActivate: [authGuard, teacherGuard],
  },
  {
    path: 'email-confirmation/confirm-email',
    component: EmailConfirmationComponent,
  },
  {
    path: 'auth/reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

