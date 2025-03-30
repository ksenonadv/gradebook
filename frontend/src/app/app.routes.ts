import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { EmailConfirmationComponent } from './components/email-confirmation/email-confirmation.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';

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
    path: 'email-confirmation/confirm-email',
    component: EmailConfirmationComponent,
  },
  {
    path: 'auth/reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  },
  {
    path: 'email-confirmation/confirm-email',
    component: EmailConfirmationComponent,
  },
  {
    path: 'auth/reset-password',
    component: ResetPasswordComponent,
  }
];

