import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseCardComponent } from './course-card.component';
import { CourseService } from '../../services/course.service';
import { NotificationsService } from '../../services/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { UserRole } from '../../interfaces/user.interface';
import { of, throwError } from 'rxjs';

describe('CourseCardComponent', () => {
  let component: CourseCardComponent;
  let fixture: ComponentFixture<CourseCardComponent>;
  let mockCourseService: jasmine.SpyObj<CourseService>;
  let mockNotificationsService: jasmine.SpyObj<NotificationsService>;
  let mockMatDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    mockCourseService = jasmine.createSpyObj('CourseService', ['destroyCourse', 'enrollStudent']);
    mockNotificationsService = jasmine.createSpyObj('NotificationsService', ['success', 'error']);
    mockMatDialog = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      imports: [CourseCardComponent],
      providers: [
        { provide: CourseService, useValue: mockCourseService },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: MatDialog, useValue: mockMatDialog },
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call destroyCourse and show success notification when deleteCourse is called', async () => {
    const mockCourse = { title: 'Test Course', teacher: { email: 'teacher@example.com' } };
    component.course = mockCourse;
    component.userRole = UserRole.Teacher;

    const response = { message: 'Course deleted successfully' };
    mockCourseService.destroyCourse.and.returnValue(Promise.resolve(response));

    await component.deleteCourse();

    expect(mockCourseService.destroyCourse).toHaveBeenCalledWith(mockCourse.title, mockCourse.teacher.email);
    expect(mockNotificationsService.success).toHaveBeenCalledWith('Success', response.message);
  });

  it('should call destroyCourse and show error notification when deleteCourse fails', async () => {
    const mockCourse = { title: 'Test Course', teacher: { email: 'teacher@example.com' } };
    component.course = mockCourse;
    component.userRole = UserRole.Teacher;

    const error = 'Error deleting course';
    mockCourseService.destroyCourse.and.returnValue(Promise.reject(error));

    await component.deleteCourse();

    expect(mockCourseService.destroyCourse).toHaveBeenCalledWith(mockCourse.title, mockCourse.teacher.email);
  });

  it('should call enrollStudent and show success notification when student is enrolled', async () => {
    const mockCourse = { title: 'Test Course', teacher: { email: 'teacher@example.com' } };
    component.course = mockCourse;
    component.userRole = UserRole.Teacher;

    const response = { message: 'Student enrolled successfully' };
    const studentEmail = 'student@example.com';
    spyOn(window, 'prompt').and.returnValue(studentEmail);
    mockCourseService.enrollStudent.and.returnValue(Promise.resolve(response));

    await component.enrollStudent();

    expect(mockCourseService.enrollStudent).toHaveBeenCalledWith(mockCourse.title, studentEmail, mockCourse.teacher.email);
  });

  it('should call enrollStudent and show error notification when enrolling fails', async () => {
    const mockCourse = { title: 'Test Course', teacher: { email: 'teacher@example.com' } };
    component.course = mockCourse;
    component.userRole = UserRole.Teacher;

    const error = 'Error enrolling student';
    const studentEmail = 'student@example.com';
    spyOn(window, 'prompt').and.returnValue(studentEmail);
    mockCourseService.enrollStudent.and.returnValue(Promise.reject(error));

    await component.enrollStudent();

    expect(mockCourseService.enrollStudent).toHaveBeenCalledWith(mockCourse.title, studentEmail, mockCourse.teacher.email);
  });

  it('should not call destroyCourse or enrollStudent if userRole is not Teacher', () => {
    component.userRole = UserRole.Student;
    const mockCourse = { title: 'Test Course', teacher: { email: 'teacher@example.com' } };
    component.course = mockCourse;

    component.deleteCourse();
    component.enrollStudent();

    expect(mockCourseService.destroyCourse).not.toHaveBeenCalled();
    expect(mockCourseService.enrollStudent).not.toHaveBeenCalled();
  });
});
