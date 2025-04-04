import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseComponent } from './course.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { InputDialogService } from '../../services/input-dialog.service';
import { UserRole } from '../../interfaces/user.interface';

describe('CourseComponent', () => {
  let component: CourseComponent;
  let fixture: ComponentFixture<CourseComponent>;
  let mockCourseService: jasmine.SpyObj<CourseService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockNotificationsService: jasmine.SpyObj<NotificationsService>;
  let mockInputDialogService: jasmine.SpyObj<InputDialogService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockCourseService = jasmine.createSpyObj('CourseService', ['getCourse', 'enrollStudent', 'addStudentGrade', 'editStudentGrade', 'deleteStudentGrade']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserData']);
    mockNotificationsService = jasmine.createSpyObj('NotificationsService', ['success', 'error']);
    mockInputDialogService = jasmine.createSpyObj('InputDialogService', ['open', 'confirm']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CourseComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } },
        { provide: Router, useValue: mockRouter },
        { provide: CourseService, useValue: mockCourseService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: InputDialogService, useValue: mockInputDialogService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /courses if no course id is provided', () => {
    mockRouter.navigate.calls.reset();
    TestBed.inject(ActivatedRoute).params = of({ id: null });
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/courses']);
  });

  it('should load course and user data on init', async () => {
 
    const mockUser = { 
      email: 'teacher@test.com', 
      firstName: 'John',
      lastName: 'Doe',
      image: '',
      name: 'Teacher Name', 
      role: UserRole.Teacher
    };

    const mockCourse = { 
      id: 1, 
      title: 'Test Course', 
      teacher: mockUser, 
      description: 'Test', 
      students: [],
    };

    mockCourseService.getCourse.and.returnValue(Promise.resolve(mockCourse));
    mockAuthService.getUserData.and.returnValue(mockUser);

    await component.ngOnInit();
    expect(component.course).toEqual(mockCourse);
    expect(component.user).toEqual(mockUser);
  });

  it('should return true for isTeacher if user is the course teacher', () => {
    component.course = { teacher: { email: 'teacher@test.com' }, title: 'Test' } as any;
    component.user = { email: 'teacher@test.com' } as any;
    expect(component.isTeacher).toBeTrue();
  });

  it('should enroll a student', async () => {

    component.course = { id:1, description: 'Awesome course', title: 'Test course', teacher: { email: 'teacher@test.ro', firstName: 'John', lastName: 'Doe', role: UserRole.Teacher, image: '' } };
    mockInputDialogService.open.and.resolveTo('student@test.com');
    mockCourseService.enrollStudent.and.resolveTo({ message: 'Enrolled successfully' });

    await component.enrollStudent();
    expect(mockCourseService.enrollStudent).toHaveBeenCalledWith(component.course!.title, 'student@test.com', component.course!.teacher.email);
    expect(mockNotificationsService.success).toHaveBeenCalledWith('Success', 'Enrolled successfully');
  });

  it('should add a student grade', async () => {
    const student = { email: 'student@test.com', grades: [] } as any;
    const mockGrade = { id: 1, grade: 10, date: new Date() };
    component.course = { id:1, description: 'Awesome course', title: 'Test course', teacher: { email: 'teacher@test.ro', firstName: 'John', lastName: 'Doe', role: UserRole.Teacher, image: '' } };

    mockInputDialogService.open.and.resolveTo('10');
    mockCourseService.addStudentGrade.and.resolveTo(mockGrade);

    await component.addStudentGrade(student);
    expect(mockCourseService.addStudentGrade).toHaveBeenCalledWith(component.course!.id, student.email, 10);
    expect(student.grades).toContain(mockGrade);
    expect(mockNotificationsService.success).toHaveBeenCalledWith('Success', 'Grade added successfully');
  });

  it('should edit a student grade', async () => {
    const student = { firstName: 'John', lastName: 'Doe' } as any;
    const grade = { id: 1, grade: 8, date: new Date() };
    mockInputDialogService.open.and.resolveTo('9');
    mockCourseService.editStudentGrade.and.resolveTo(true);

    await component.editStudentGrade(student, grade);
    expect(mockCourseService.editStudentGrade).toHaveBeenCalledWith(grade.id, 9);
    expect(mockNotificationsService.success).toHaveBeenCalledWith('Success', 'Grade edited successfully');
  });

  it('should delete a student grade', async () => {
    const student = { firstName: 'John', lastName: 'Doe', grades: [{ id: 1, grade: 8 }] } as any;
    const grade = { id: 1, grade: 8, date: new Date() };
    mockInputDialogService.confirm.and.resolveTo(true);
    mockCourseService.deleteStudentGrade.and.returnValue(Promise.resolve(true));

    await component.deleteStudentGrade(student, grade);
    expect(mockInputDialogService.confirm).toHaveBeenCalled();
    expect(mockCourseService.deleteStudentGrade).toHaveBeenCalledWith(grade.id);
    expect(student.grades).not.toContain(grade);
    expect(mockNotificationsService.success).toHaveBeenCalledWith('Success', 'Grade deleted successfully');
  });
});
