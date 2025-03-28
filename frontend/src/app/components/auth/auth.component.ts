import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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
    CommonModule
  ]
})
export class AuthComponent {

  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  
  public form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    firstname: [''],
    lastname: ['']
  });

  public authAction = 'login';

  private readonly authService = inject(AuthService);

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
    ).catch(error => {
      if (error.error) {
        alert(error.error.message);
      } else {
        alert('An error occurred while logging in. Please try again later.');
      }
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
      },
      error: (data) => {
        if (data.error) {
          alert(data.error.message);
        } else {
          alert('An error occurred while registering. Please try again later.');
        }
      }
    });
  }
}
