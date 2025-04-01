import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { ImagesService } from '../../services/images.service';
import { of } from 'rxjs';
import { FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let notificationsServiceSpy: jasmine.SpyObj<NotificationsService>;
  let imagesServiceSpy: jasmine.SpyObj<ImagesService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['changeEmail'], { userData$: of({ email: 'test@example.com', image: '' }) });
    notificationsServiceSpy = jasmine.createSpyObj('NotificationsService', ['success', 'error']);
    imagesServiceSpy = jasmine.createSpyObj('ImagesService', ['changeImage']);

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: NotificationsService, useValue: notificationsServiceSpy },
        { provide: ImagesService, useValue: imagesServiceSpy },
        FormBuilder
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load user data and set email in form', () => {
    expect(component.user?.email).toBe('test@example.com');
    expect(component.form.value.email).toBe('test@example.com');
  });

  it('should call changeEmail on valid form submission', async () => {
    authServiceSpy.changeEmail.and.returnValue(Promise.resolve('Email changed successfully'));
    component.form.setValue({ email: 'new@example.com' });

    await component.onSubmit();

    expect(authServiceSpy.changeEmail).toHaveBeenCalledWith('test@example.com', 'new@example.com');
    expect(notificationsServiceSpy.success).toHaveBeenCalledWith('Success', 'Email changed successfully');
  });

  it('should not call changeEmail if form is invalid', async () => {
    component.form.setValue({ email: 'invalid-email' });
    await component.onSubmit();
    expect(authServiceSpy.changeEmail).not.toHaveBeenCalled();
    expect(notificationsServiceSpy.success).not.toHaveBeenCalled();
  });

  it('should not call changeImage if no file is selected', () => {
    const event = { files: [] };
    component.onImageUpload(event);

    expect(imagesServiceSpy.changeImage).not.toHaveBeenCalled();
  });
});
