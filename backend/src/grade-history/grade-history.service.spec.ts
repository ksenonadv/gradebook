import { Test, TestingModule } from '@nestjs/testing';
import { GradeHistoryService } from './grade-history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GradeHistory } from '../entities/grade-history.entity';
import { StudentCourseGrade } from '../entities/grade.entity';
import { UserService } from '../user/user.service';

describe('GradeHistoryService', () => {
  let service: GradeHistoryService;

  const mockGradeHistoryRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockUserService = {
    findStudentWithRelations: jest.fn(),
    findTeacherByEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradeHistoryService,
        {
          provide: getRepositoryToken(GradeHistory),
          useValue: mockGradeHistoryRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<GradeHistoryService>(GradeHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create and save a grade history', async () => {
    const mockGrade = {} as StudentCourseGrade;
    const mockAction = 'ADD' as any;
    const mockNewValue = 90;

    mockGradeHistoryRepository.create.mockReturnValue({ id: 1 });
    mockGradeHistoryRepository.save.mockResolvedValue({ id: 1 });

    await service.addGradeHistory(mockGrade, mockAction, mockNewValue);

    expect(mockGradeHistoryRepository.create).toHaveBeenCalledWith({
      studentCourseGrade: mockGrade,
      action: mockAction,
      newValue: mockNewValue,
      date: expect.any(Date),
    });
    expect(mockGradeHistoryRepository.save).toHaveBeenCalled();
  });

  it('should create and save an edited grade history', async () => {
    const mockGrade = {} as StudentCourseGrade;
    const mockAction = 'EDIT' as any;
    const mockOldValue = 80;
    const mockNewValue = 90;

    mockGradeHistoryRepository.create.mockReturnValue({ id: 1 });
    mockGradeHistoryRepository.save.mockResolvedValue({ id: 1 });

    await service.editGradeHistory(mockGrade, mockAction, mockOldValue, mockNewValue);

    expect(mockGradeHistoryRepository.create).toHaveBeenCalledWith({
      studentCourseGrade: mockGrade,
      action: mockAction,
      oldValue: mockOldValue,
      newValue: mockNewValue,
      date: expect.any(Date),
    });
    expect(mockGradeHistoryRepository.save).toHaveBeenCalled();
  });

  it('should create and save a deleted grade history', async () => {
    const mockGrade = {} as StudentCourseGrade;
    const mockAction = 'DELETE' as any;
    const mockOldValue = 80;

    mockGradeHistoryRepository.create.mockReturnValue({ id: 1 });
    mockGradeHistoryRepository.save.mockResolvedValue({ id: 1 });

    await service.deleteGradeHistory(mockGrade, mockAction, mockOldValue);

    expect(mockGradeHistoryRepository.create).toHaveBeenCalledWith({
      studentCourseGrade: mockGrade,
      action: mockAction,
      oldValue: mockOldValue,
      date: expect.any(Date),
    });
    expect(mockGradeHistoryRepository.save).toHaveBeenCalled();
  });

  it('should return grade history for a student', async () => {
    const mockStudentEmail = 'student@example.com';
    const mockStudent = { id: 1, enrolledCourses: [] };
    const mockGradeHistory = [{ id: 1 }];

    mockUserService.findStudentWithRelations.mockResolvedValue(mockStudent);
    mockGradeHistoryRepository.find.mockResolvedValue(mockGradeHistory);

    const result = await service.getGradeHistoryByStudent(mockStudentEmail);

    expect(mockUserService.findStudentWithRelations).toHaveBeenCalledWith({
      where: { email: mockStudentEmail },
      relations: ['enrolledCourses'],
    });
    expect(mockGradeHistoryRepository.find).toHaveBeenCalledWith({
      where: {
        studentCourseGrade: {
          studentCourse: {
            student: mockStudent,
          },
        },
      },
      relations: ['studentCourseGrade', 'studentCourseGrade.studentCourse'],
    });
    expect(result).toEqual(mockGradeHistory);
  });

  it('should return grade history for a teacher', async () => {
    const mockTeacherEmail = 'teacher@example.com';
    const mockTeacher = { id: 1 };
    const mockGradeHistory = [{ id: 1 }];

    mockUserService.findTeacherByEmail.mockResolvedValue(mockTeacher);
    mockGradeHistoryRepository.find.mockResolvedValue(mockGradeHistory);

    const result = await service.getGradeHistoryByTeacher(mockTeacherEmail);

    expect(mockUserService.findTeacherByEmail).toHaveBeenCalledWith(mockTeacherEmail);
    expect(mockGradeHistoryRepository.find).toHaveBeenCalledWith({
      where: {
        studentCourseGrade: {
          studentCourse: {
            course: {
              teacher: mockTeacher,
            },
          },
        },
      },
      relations: ['studentCourseGrade', 'studentCourseGrade.studentCourse'],
    });
    expect(result).toEqual(mockGradeHistory);
  });
});
