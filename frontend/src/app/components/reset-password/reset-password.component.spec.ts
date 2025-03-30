import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordComponent } from './reset-password.component';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { routes } from '../../app.routes';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationsServiceSpy: jasmine.SpyObj<NotificationsService>;

  beforeEach(async () => {

    authServiceSpy = jasmine.createSpyObj('AuthService', ['resetPassword']);
    notificationsServiceSpy = jasmine.createSpyObj('NotificationsService', ['success', 'error']);

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationsService, useValue: notificationsServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({ token: 'test-token' }) }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should set token from queryParams', () => {
    expect(component.token).toBe('test-token');
  });

  it('should mark form as invalid if password is empty', () => {
    component.form.setValue({ password: '' });
    expect(component.form.invalid).toBeTrue();
  });

  it('should call resetPassword on valid form submission', async () => {
    authServiceSpy.resetPassword.and.returnValue(Promise.resolve('Password reset successfully'));
    component.form.setValue({ password: 'newPassword123' });

    await component.onSubmit();

    expect(authServiceSpy.resetPassword).toHaveBeenCalledWith('test-token', 'newPassword123');
    expect(notificationsServiceSpy.success);
  });

  it('should show error notification on resetPassword failure', async () => {
    authServiceSpy.resetPassword.and.returnValue(Promise.reject('Reset failed'));
    component.form.setValue({ password: 'newPassword123' });

    await component.onSubmit();

    expect(notificationsServiceSpy.error);
  });
});
