import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    SelectButtonModule,
    ButtonModule,
    InputTextModule,
    CommonModule,
    RouterModule
  ],
})
export class AuthComponent {

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  
  public form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    firstname: [''],
    lastname: ['']
  });

  public authAction = 'login';

  private readonly authService = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);

  constructor() {
    if (this.authService.isLoggedIn) {
      this.router.navigate([
        '/courses'
      ]);
    }
  }

  public switchAction(action: string): void {   
    
    this.authAction = action;

    const isRegister = action === 'register';
    
    this.form.get('firstname')?.setValidators(isRegister ? [Validators.required] : []);
    this.form.get('lastname')?.setValidators(isRegister ? [Validators.required] : []);
    this.form.get('firstname')?.updateValueAndValidity();
    this.form.get('lastname')?.updateValueAndValidity();

    this.form.reset();
  }

  onSubmit(): void {
    
    if (!this.form.valid)
      return;

    if (this.authAction === 'login')
      return this.login();
    
    this.register();
  }

  private login(): void {
    this.authService.login(
      this.form.value.email,
      this.form.value.password
    ).then(() => {
      this.notificationsService.success(
        'Login Successful',
        'You have successfully logged in.'
      );
      this.router.navigate(['/courses']);
    }).catch(error => {
      this.notificationsService.error(
        'Authentication Error',
        error.error ? error.error.message : 'An error occurred while logging in.'
      );
    });
  }

  private register(): void {
    this.authService.register(
      this.form.value.email,
      this.form.value.firstname,
      this.form.value.lastname,
      this.form.value.password
    ).subscribe({
      next: () => {
        
        this.switchAction(
          'login'
        );

        this.form.reset();

        this.notificationsService.success(
          'Registration Successful',
          'You have successfully registered. Please log in.'
        );
      },
      error: (data) => {
        this.notificationsService.error(
          'Registration Error',
          data.error && data.error.message ? data.error.message : 'An error occurred while registering.'
        );
      }
    });
  }
}
