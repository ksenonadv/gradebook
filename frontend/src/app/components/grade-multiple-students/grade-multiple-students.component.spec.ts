import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GradeMultipleStudentsComponent } from './grade-multiple-students.component';
import { CourseService } from '../../services/course.service';
import { NotificationsService } from '../../services/notifications.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of, throwError } from 'rxjs';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CoursePageInfo } from '../../interfaces/course.interface';
import { UserRole } from '../../interfaces/user.interface';

describe('GradeMultipleStudentsComponent', () => {
  let component: GradeMultipleStudentsComponent;
  let fixture: ComponentFixture<GradeMultipleStudentsComponent>;
  let courseServiceMock: jasmine.SpyObj<CourseService>;
  let notificationsServiceMock: jasmine.SpyObj<NotificationsService>;
  let routerMock: jasmine.SpyObj<Router>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    courseServiceMock = jasmine.createSpyObj('CourseService', ['getCourse', 'submitGradesForCourse']);
    notificationsServiceMock = jasmine.createSpyObj('NotificationsService', ['success', 'error']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    authServiceMock = jasmine.createSpyObj('AuthService', ['getUserData']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, RouterTestingModule, HttpClientTestingModule, GradeMultipleStudentsComponent],
      declarations: [],
      providers: [
        { provide: CourseService, useValue: courseServiceMock },
        { provide: NotificationsService, useValue: notificationsServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: { params: of({ id: 1 }) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GradeMultipleStudentsComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should successfully submit grades for enrolled students', async () => {
    const courseMock: CoursePageInfo = {
      id: 1,
      title: 'Course Title',
      description: 'Course Description',
      teacher: {
        firstName: 'John', 
        lastName: 'Doe', 
        email: 'john.doe@example.com',
        role: UserRole.Teacher,
        image: 'url_to_image',
      },
      students: [
        {
          firstName: 'John', 
          lastName: 'Doe', 
          email: 'john.doe@example.com',
          role: UserRole.Student,
          image: 'url_to_image',
          grades: []
        },
        {
          firstName: 'Jane', 
          lastName: 'Doe', 
          email: 'jane.doe@example.com',
          role: UserRole.Student,
          image: 'url_to_image',
          grades: []
        }
      ]
    };
  
    authServiceMock.getUserData.and.returnValue({
      firstName: 'John', 
      lastName: 'Doe', 
      email: 'john.doe@example.com',
      role: UserRole.Teacher,
      image: 'url_to_image',
    });
  
    courseServiceMock.getCourse.and.returnValue(Promise.resolve(courseMock));
  
    fixture.detectChanges();
  
    component.students = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', inputGrade: 10 },
      { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', inputGrade: 9 },
    ];
  
    courseServiceMock.submitGradesForCourse.and.callFake((courseId: number, gradesArray: Array<{ email: string, grade: number }>) => {
      return new Promise((resolve) => {
        resolve({ message: 'Grades successfully submitted' });
      });
    });
  
    await component.submitGrades();
  
    expect(notificationsServiceMock.success).toHaveBeenCalledWith('Success', 'The grades were successfully submitted.');
  
    expect(routerMock.navigate).toHaveBeenCalledWith(['/course', courseMock.id]);
  
    expect(courseServiceMock.submitGradesForCourse).toHaveBeenCalledWith(1, [
      { email: 'john.doe@example.com', grade: 10 },
      { email: 'jane.doe@example.com', grade: 9 },
    ]);
  });
  
});
