import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CoursesComponent } from './courses.component';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject } from 'rxjs';
import { UserRole, User } from '../../interfaces/user.interface';

describe('CoursesComponent', () => {
  let component: CoursesComponent;
  let fixture: ComponentFixture<CoursesComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockCourseService: jasmine.SpyObj<CourseService>;
  let mockNotificationsService: jasmine.SpyObj<NotificationsService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['userData$']);
    mockCourseService = jasmine.createSpyObj('CourseService', ['findCoursesByTeacher', 'findCoursesByStudent']);
    mockNotificationsService = jasmine.createSpyObj('NotificationsService', ['success', 'error']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    const mockUserData$ = new BehaviorSubject<User | undefined>(undefined);
    Object.defineProperty(mockAuthService, 'userData$', {
      get: () => mockUserData$,
      configurable: true
    });

    TestBed.configureTestingModule({
      imports: [CoursesComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CourseService, useValue: mockCourseService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: MatDialog, useValue: mockDialog },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CoursesComponent);
    component = fixture.componentInstance;
  });

  it('should load courses for teacher when role is Teacher', fakeAsync(() => {
    const mockUser: User = { 
      role: UserRole.Teacher, 
      email: 'teacher@example.com', 
      firstName: 'John', 
      lastName: 'Doe',
      image: ''
    };

    (mockAuthService.userData$ as BehaviorSubject<User | undefined>).next(mockUser);

    const mockCourses = [{ title: 'Course 1' }, { title: 'Course 2' }];
    mockCourseService.findCoursesByTeacher.and.returnValue(Promise.resolve(mockCourses));

    fixture.detectChanges();
    tick();

    expect(component.courses).toEqual(mockCourses);
    expect(mockCourseService.findCoursesByTeacher).toHaveBeenCalledWith('teacher@example.com');
  }));

  it('should load courses for student when role is Student', fakeAsync(() => {
    const mockUser: User = { 
      role: UserRole.Student, 
      email: 'student@example.com', 
      firstName: 'Jane', 
      lastName: 'Smith',
      image: ''
    };

    (mockAuthService.userData$ as BehaviorSubject<User | undefined>).next(mockUser);

    const mockCourses = [{ title: 'Course A' }, { title: 'Course B' }];
    mockCourseService.findCoursesByStudent.and.returnValue(Promise.resolve(mockCourses));

    fixture.detectChanges();
    tick();

    expect(component.courses).toEqual(mockCourses);
    expect(mockCourseService.findCoursesByStudent).toHaveBeenCalledWith('student@example.com');
  }));

  it('should call notificationsService.error if there is an error loading courses', fakeAsync(() => {
    const mockUser: User = { 
      role: UserRole.Teacher, 
      email: 'teacher@example.com', 
      firstName: 'John', 
      lastName: 'Doe',
      image: ''
    };

    (mockAuthService.userData$ as BehaviorSubject<User | undefined>).next(mockUser);

    mockCourseService.findCoursesByTeacher.and.returnValue(Promise.reject('Error loading courses'));

    fixture.detectChanges();
    tick();

    expect(mockNotificationsService.error).toHaveBeenCalledWith('Error', 'Error loading courses');
  }));
});
