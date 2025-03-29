import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthComponent } from './auth.component';
import { ReactiveFormsModule } from '@angular/forms';
import { providers } from '../../test.providers';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent, ReactiveFormsModule],
      providers
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.form.value).toEqual({
      email: '',
      password: '',
      firstname: '',
      lastname: ''
    });
  });

  it('should switch to register action and update validators', () => {
    component.switchAction('register');
    expect(component.authAction).toBe('register');
    expect(component.form.get('firstname')?.validator).toBeTruthy();
    expect(component.form.get('lastname')?.validator).toBeTruthy();
  });

  it('should switch to login action and clear validators', () => {
    component.switchAction('login');
    expect(component.authAction).toBe('login');
    expect(component.form.get('firstname')?.validator).toBeNull();
    expect(component.form.get('lastname')?.validator).toBeNull();
  });

  it('should reset the form when switching actions', () => {
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123',
      firstname: 'John',
      lastname: 'Doe'
    });
    component.switchAction('register');
    expect(component.form.value).toEqual({
      email: '',
      password: '',
      firstname: '',
      lastname: ''
    });
  });

  it('should not submit the form if it is invalid', () => {
    component.form.patchValue({
      email: '',
      password: ''
    });
    const loginSpy = spyOn<any>(component, 'login');
    const registerSpy = spyOn<any>(component, 'register');
    component.onSubmit();
    expect(loginSpy).not.toHaveBeenCalled();
    expect(registerSpy).not.toHaveBeenCalled();
  });

  it('should call login method when authAction is login and form is valid', () => {
    component.authAction = 'login';
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123'
    });
    const loginSpy = spyOn<any>(component, 'login');
    component.onSubmit();
    expect(loginSpy).toHaveBeenCalled();
  });

  it('should call register method when authAction is register and form is valid', () => {
    component.authAction = 'register';
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123',
      firstname: 'John',
      lastname: 'Doe'
    });
    const registerSpy = spyOn<any>(component, 'register');
    component.onSubmit();
    expect(registerSpy).toHaveBeenCalled();
  });
});