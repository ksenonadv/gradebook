import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
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
    path: '**',
    redirectTo: 'dashboard'
  },
  {
    path: 'email-confirmation/confirm-email',
    component: AuthComponent,
    canActivate: [],
  },
  {
    path: 'auth/reset-password',
    component: AuthComponent,
    canActivate: []
  }
];

