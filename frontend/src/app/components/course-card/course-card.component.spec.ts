import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseCardComponent } from './course-card.component';
import { CourseService } from '../../services/course.service';
import { NotificationsService } from '../../services/notifications.service';
import { MatDialog } from '@angular/material/dialog';

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

  describe('deleteCourse', () => {
    it('should call destroyCourse and show success notification when isTeacher is true and delete is successful', async () => {
      component.isTeacher = true;
      component.course = { title: 'Test Course', teacher: { email: 'teacher@test.com' } };
      mockCourseService.destroyCourse.and.returnValue(Promise.resolve({ message: 'Course deleted successfully' }));

      await component.deleteCourse();

      expect(mockCourseService.destroyCourse).toHaveBeenCalledWith('Test Course', 'teacher@test.com');
      expect(mockNotificationsService.success).toHaveBeenCalledWith('Success', 'Course deleted successfully');
    });

    it('should not call destroyCourse when isTeacher is false', async () => {
      component.isTeacher = false;
      component.course = { title: 'Test Course', teacher: { email: 'teacher@test.com' } };

      await component.deleteCourse();

      expect(mockCourseService.destroyCourse).not.toHaveBeenCalled();
      expect(mockNotificationsService.success).not.toHaveBeenCalled();
      expect(mockNotificationsService.error).not.toHaveBeenCalled();
    });
  });

});
