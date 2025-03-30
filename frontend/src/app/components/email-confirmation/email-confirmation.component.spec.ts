import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailConfirmationComponent } from './email-confirmation.component';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { providers } from '../../test.providers';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { Router } from '@angular/router';

describe('EmailConfirmationComponent', () => {
  let component: EmailConfirmationComponent;
  let fixture: ComponentFixture<EmailConfirmationComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let notificationsService: jasmine.SpyObj<NotificationsService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['forgotPassword']);
    const notificationsServiceSpy = jasmine.createSpyObj('NotificationsService', ['success', 'error']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [EmailConfirmationComponent, ReactiveFormsModule],
      providers: [
        providers,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationsService, useValue: notificationsServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmailConfirmationComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    notificationsService = TestBed.inject(NotificationsService) as jasmine.SpyObj<NotificationsService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with an empty email', () => {
    expect(component.form.value).toEqual({
      email: ''
    });
  });

  it('should call forgotPassword method and show success message on valid form', () => {
    const mockMessage = 'Check your inbox for confirmation.';
    authService.forgotPassword.and.returnValue(Promise.resolve(mockMessage));

    component.form.patchValue({ email: 'test@example.com' });
    component.onSubmit();

    expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    expect(notificationsService.success).toHaveBeenCalledWith('Success', mockMessage);
    expect(router.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('should show error message if forgotPassword fails', () => {
    const errorResponse = { error: { message: 'Email not found' } };
    authService.forgotPassword.and.returnValue(Promise.reject(errorResponse));

    component.form.patchValue({ email: 'wrong@example.com' });
    component.onSubmit();

    expect(authService.forgotPassword).toHaveBeenCalledWith('wrong@example.com');
    expect(notificationsService.error).toHaveBeenCalledWith('Error', 'Email not found');
  });

  it('should not submit the form if it is invalid', () => {
    component.form.patchValue({ email: '' });
    const submitSpy = spyOn(component, 'onSubmit').and.callThrough();

    component.onSubmit();

    expect(submitSpy).toHaveBeenCalled();
    expect(authService.forgotPassword).not.toHaveBeenCalled();
    expect(notificationsService.error).toHaveBeenCalledWith('Error', 'Invalid email format.');
  });

  it('should show error if email is required and form is touched', () => {
    const emailInput = component.form.get('email');
    emailInput?.markAsTouched();
    emailInput?.setValue('');

    fixture.detectChanges();
    const errorElement = fixture.debugElement.nativeElement.querySelector('.error');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Email is required');
  });

  it('should show error if email is invalid', () => {
    const emailInput = component.form.get('email');
    emailInput?.setValue('invalid-email');
    emailInput?.markAsTouched();

    fixture.detectChanges();
    const errorElement = fixture.debugElement.nativeElement.querySelector('.error');
    expect(errorElement).toBeTruthy();
    expect(errorElement.textContent).toContain('Invalid email format.');
  });
});
