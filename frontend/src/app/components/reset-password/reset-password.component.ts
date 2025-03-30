import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})

export class ResetPasswordComponent {
  token: string = "";

  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  
  private readonly authService = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);

  public form: FormGroup = this.formBuilder.group({
    password: ['', [Validators.required]]
  });

  constructor(private route: ActivatedRoute){
  }

  ngOnInit(): void{
    this.route.queryParams.subscribe(params =>{
      this.token = params['token'];
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.authService.resetPassword(
      this.token,
      this.form.value.password
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
