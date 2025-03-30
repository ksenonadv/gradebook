import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CommonModule,
    RouterModule
  ],
})

export class EmailConfirmationComponent {
  
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  
  private readonly authService = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);

  public form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]]
  });

  constructor() {}

  onSubmit(): void {
    if (this.form.invalid) return;

    this.authService.forgotPassword(
      this.form.value.email
    ).then((message: string) => {
      this.notificationsService.success(
        'Success',
        message
      );
      this.router.navigate(['/auth']);
    }).catch(error => {
      this.notificationsService.error(
        'Error',
        error
      );
    });
  }

}
