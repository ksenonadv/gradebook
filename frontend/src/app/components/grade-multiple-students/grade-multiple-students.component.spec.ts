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
import * as Papa from 'papaparse';


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
  
  it('should process the selected file and validate headers correctly', () => {
    const fileMock = new Blob([`email,grade\njohn.doe@example.com,10\njane.doe@example.com,9`], { type: 'text/csv' });
    const event = { target: { files: [fileMock] } };

    spyOn(Papa, 'parse').and.callThrough();

    component.onFileSelected(event);

    expect(Papa.parse).toHaveBeenCalled();
    expect(component.csvErrors.length).toBe(0);
    expect(component.showCsvErrorsModal).toBeFalse();
  });

  it('should show error for invalid CSV headers', (done) => {
    const fileMock = new Blob([`name,score\njohn.doe@example.com,10\njane.doe@example.com,9`], { type: 'text/csv' });
    const event = { target: { files: [fileMock] } };
  
    component.onFileSelected(event);
  
    setTimeout(() => {
      expect(component.csvErrors).toContain('Invalid CSV headers. Expected headers: "email", "grade"');
      expect(component.showCsvErrorsModal).toBeTrue();
      done();
    }, 1);
  });

  it('should process CSV and correctly update grades', (done) => {
    const fileMock = new Blob([`email,grade\njohn.doe@example.com,10\njane.doe@example.com,9`], { type: 'text/csv' });
    const event = { target: { files: [fileMock] } };
  
    component.students = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', inputGrade: undefined },
      { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', inputGrade: undefined }
    ];
  
    component.onFileSelected(event);
  
    setTimeout(() => {
      expect(component.students?.[0]?.inputGrade).toBe(10);
      expect(component.students?.[1]?.inputGrade).toBe(9);
      expect(component.csvErrors.length).toBe(0);
      done();
    }, 1);
  });
  
  

});
