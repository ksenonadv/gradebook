import { Routes } from '@angular/router';
import { AuthComponent } from './components/auth/auth.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  /*{
    path: '**',
    redirectTo: 'dashboard',
  }*/
];
