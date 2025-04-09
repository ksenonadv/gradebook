import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { GradeHistoryComponent } from './grade-history.component';
import { GradeHistoryService } from '../../services/grade-history.service';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../interfaces/user.interface';
import { Action } from '../../interfaces/grade-history.interface';

describe('GradeHistoryComponent', () => {
  let component: GradeHistoryComponent;
  let fixture: ComponentFixture<GradeHistoryComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockGradeHistoryService: jasmine.SpyObj<GradeHistoryService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['getUserData']);
    mockGradeHistoryService = jasmine.createSpyObj('GradeHistoryService', ['getGradeHistoryByStudent', 'getGradeHistoryByTeacher']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [GradeHistoryComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: GradeHistoryService, useValue: mockGradeHistoryService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GradeHistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch grade history for a student and sort it', () => {
    const mockUser = { role: UserRole.Student, email: 'student@example.com', firstName: 'Jane', lastName: 'Smith', image: '' };
    const mockGradeHistory = [
      { date: '2023-01-01' },
      { date: '2023-02-01' },
    ];
    mockAuthService.getUserData.and.returnValue(mockUser);
    mockGradeHistoryService.getGradeHistoryByStudent.and.returnValue(of(mockGradeHistory));

    component.ngOnInit();

    expect(mockGradeHistoryService.getGradeHistoryByStudent).toHaveBeenCalledWith('student@example.com');
    expect(component.gradeHistory).toEqual([
      { date: '2023-02-01' },
      { date: '2023-01-01' },
    ]);
  });

  it('should fetch grade history for a teacher and sort it', () => {
    const mockUser = { role: UserRole.Teacher, email: 'teacher@example.com', firstName: 'John', lastName: 'Doe', image: '' };
    const mockGradeHistory = [
      { date: '2023-01-01' },
      { date: '2023-02-01' },
    ];
    mockAuthService.getUserData.and.returnValue(mockUser);
    mockGradeHistoryService.getGradeHistoryByTeacher.and.returnValue(of(mockGradeHistory));

    component.ngOnInit();

    expect(mockGradeHistoryService.getGradeHistoryByTeacher).toHaveBeenCalledWith('teacher@example.com');
    expect(component.gradeHistory).toEqual([
      { date: '2023-02-01' },
      { date: '2023-01-01' },
    ]);
  });

  it('should navigate to /courses on error for a student', () => {
    const mockUser = { role: UserRole.Student, email: 'student@example.com', firstName: 'John', lastName: 'Doe', image: '' };
    mockAuthService.getUserData.and.returnValue(mockUser);
    mockGradeHistoryService.getGradeHistoryByStudent.and.returnValue(throwError(() => new Error('Error')));

    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/courses']);
  });

  it('should navigate to /courses on error for a teacher', () => {
    const mockUser = { role: UserRole.Teacher, email: 'student@example.com', firstName: 'John', lastName: 'Doe', image: '' };
    mockAuthService.getUserData.and.returnValue(mockUser);
    mockGradeHistoryService.getGradeHistoryByTeacher.and.returnValue(throwError(() => new Error('Error')));

    component.ngOnInit();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/courses']);
  });

  it('should return correct action label', () => {
    expect(component.getActionLabel(Action.Update)).toBe('Update');
    expect(component.getActionLabel(Action.Delete)).toBe('Delete');
    expect(component.getActionLabel(Action.Create)).toBe('Add');
  });
});
