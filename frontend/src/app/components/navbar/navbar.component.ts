import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  imports: [Menubar, RouterModule],
})
export class NavbarComponent {
  
  public items: Array<MenuItem> = [
    {
      label: 'Dashboard',
      routerLink: '/dashboard',
      routerLinkActiveOptions: { exact: true },
    },
    {
      label: 'Courses',
      routerLink: '/courses',
      disabled: true,
      routerLinkActiveOptions: { exact: true },
    },
  ];

  private readonly authService = inject(AuthService); 
  public user: User | undefined = undefined;

  private destroyRef = inject(DestroyRef);
  
  constructor() {
    this.authService.userData$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user: User | undefined) => {
      this.user = user;
    });
  }
}
