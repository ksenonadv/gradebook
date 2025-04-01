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
import { ImagesService } from '../../services/images.service';

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

  private readonly imagesService = inject(ImagesService);

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

  public onSubmit(): void {
    if (!this.form.valid || !this.user)
      return;

    this.authService.changeEmail(
      this.user.email,
      this.form.value.email
    ).then((message: string) => {
      this.notificationsService.success(
        'Success',
        message
      );
    }).catch(error => {
      this.notificationsService.error(
        'Error',
        error
      );
    });
  }

  public onImageUpload(event: any) {
    const file = event.files[0];
    if (!this.user || !file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const imageBase64 = reader.result as string;

        if(!this.user?.email)
           return;
   
        this.imagesService.changeImage(this.user.email, imageBase64)
            .then((message: string) => {
                this.notificationsService.success(
                  'Succes', 
                  message
                );
            })
            .catch(error => {
                this.notificationsService.error(
                  'Error',
                   error
                );
            });
    };
    reader.onerror = error => {
        console.error('Error converting file to Base64:', error);
    };
  } 
}