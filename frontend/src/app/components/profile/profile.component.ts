import { Component, DestroyRef, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationsService } from '../../services/notifications.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [
    RouterModule,
    FileUploadModule,
    ButtonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

  private readonly authService = inject(AuthService); 
  public user: User | undefined = undefined;

  private readonly formBuilder = inject(FormBuilder);
  private readonly notificationsService = inject(NotificationsService);

  public form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  private destroyRef = inject(DestroyRef);

  constructor() {
    this.authService.userData$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user: User | undefined) => {
      this.user = user;
      if (this.user) {
        this.form.patchValue({
          email: this.user.email
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Form submitted:', this.form.value);
    }
  }
}