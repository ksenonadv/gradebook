import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CoursesGradesComponent } from './courses-grades.component';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('CoursesGradesComponent', () => {
  let component: CoursesGradesComponent;
  let fixture: ComponentFixture<CoursesGradesComponent>;
  let mockCourseService: any;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockCourseService = {
      findCoursesByStudent: jasmine.createSpy().and.returnValue(Promise.resolve([]))
    };

    mockAuthService = {
      getUserData: jasmine.createSpy().and.returnValue({ email: 'king@royal.palace' })
    };

    mockRouter = {
      navigate: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      imports: [CoursesGradesComponent],
      providers: [
        { provide: CourseService, useValue: mockCourseService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CoursesGradesComponent);
    component = fixture.componentInstance;
  });

  it('should call findCoursesByStudent on init and set courses', async () => {
    await component.ngOnInit();
    expect(mockAuthService.getUserData).toHaveBeenCalled();
    expect(mockCourseService.findCoursesByStudent).toHaveBeenCalledWith('king@royal.palace');
    expect(component.courses).toEqual([]);
  });

});
