import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { UserService } from '../user/user.service';
import { StudentCourseService } from '../student-course/student-course.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from '../entities/course.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StudentCourseGrade } from '../entities/grade.entity';
import { UserRole } from '../entities/user.entity';

describe('CourseService', () => {
  let service: CourseService;
  let userService: UserService;
  let studentCourseService: StudentCourseService;
  let courseRepo: Repository<Course>;

  const mockUserService = {
    findTeacherByEmail: jest.fn().mockResolvedValue({ email: 'teacher@example.com' }),
  };

  const mockStudentCourseService = {
    enrollStudent: jest.fn(),
  };

  const mockCourseRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockResolvedValue(true),
    findOne: jest.fn().mockResolvedValue(null), // Simulăm că nu există cursul
    remove: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: UserService, useValue: mockUserService },
        { provide: StudentCourseService, useValue: mockStudentCourseService },
        { provide: getRepositoryToken(Course), useValue: mockCourseRepo },
        { provide: getRepositoryToken(StudentCourseGrade), useValue: {} },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    userService = module.get<UserService>(UserService);
    studentCourseService = module.get<StudentCourseService>(StudentCourseService);
    courseRepo = module.get<Repository<Course>>(getRepositoryToken(Course));
  });

  it('should create a course', async () => {
    mockCourseRepo.findOne.mockResolvedValueOnce(null);

    const result = await service.createCourse('Course Title', 'Course Description', 'teacher@example.com');

    expect(mockUserService.findTeacherByEmail).toHaveBeenCalledWith('teacher@example.com');
    expect(mockCourseRepo.create).toHaveBeenCalledWith({
      title: 'Course Title',
      description: 'Course Description',
      teacher: { email: 'teacher@example.com' },
    });
    expect(mockCourseRepo.save).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should enroll a student into a course', async () => {
    const course = { title: 'Course Title', description: 'Course Description' };
    mockCourseRepo.findOne.mockResolvedValueOnce(course);
    mockStudentCourseService.enrollStudent.mockResolvedValue(true);

    const result = await service.enrollStudent('Course Title', 'student@example.com', 'teacher@example.com');
    expect(mockStudentCourseService.enrollStudent).toHaveBeenCalledWith(course, 'student@example.com', 'teacher@example.com');
    expect(result).toBe(true);
  });

  it('should throw an error if student tries to enroll in a non-existent course', async () => {
    mockCourseRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.enrollStudent('Non-Existing Course', 'student@example.com', 'teacher@example.com'))
      .rejects.toThrowError(new NotFoundException('No course found with title: "Non-Existing Course"'));
  });

  it('should add a grade for a student', async () => {
    const course = {
      id: 1,
      teacher: { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] },
      students: [{ student: { email: 'student@example.com' } }],
    };
    const teacher = course.teacher;
    const gradeEntity = { id: 1, date: new Date(), grade: 95 };

    mockCourseRepo.findOne.mockResolvedValueOnce(course);
    const mockStudentCourseGradeRepo = {
      create: jest.fn().mockReturnValue(gradeEntity),
      save: jest.fn().mockResolvedValue(gradeEntity),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: UserService, useValue: mockUserService },
        { provide: StudentCourseService, useValue: mockStudentCourseService },
        { provide: getRepositoryToken(Course), useValue: mockCourseRepo },
        { provide: getRepositoryToken(StudentCourseGrade), useValue: mockStudentCourseGradeRepo },
      ],
    }).compile();

    const serviceWithGradeRepo = module.get<CourseService>(CourseService);

    const result = await serviceWithGradeRepo.addStudentGrade(1, 'student@example.com', 95, teacher);

    expect(mockCourseRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['teacher', 'students', 'students.student'],
    });
    expect(mockStudentCourseGradeRepo.create).toHaveBeenCalledWith({
      studentCourse: course.students[0],
      date: expect.any(Date),
      grade: 95,
    });
    expect(mockStudentCourseGradeRepo.save).toHaveBeenCalledWith(gradeEntity);
    expect(result).toEqual({
      id: gradeEntity.id,
      date: gradeEntity.date,
      grade: gradeEntity.grade,
    });
  });

  it('should throw an error if trying to add a grade for a non-existent course', async () => {
    mockCourseRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.addStudentGrade(1, 'student@example.com', 95, { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] }))
      .rejects.toThrowError(new NotFoundException('No course found with id: 1'));
  });

  it('should throw an error if teacher is not authorized to add a grade', async () => {
    const course = {
      id: 1,
      teacher: { id: 2 },
      students: [{ student: { email: 'student@example.com' } }],
    };

    mockCourseRepo.findOne.mockResolvedValueOnce(course);

    await expect(service.addStudentGrade(1, 'student@example.com', 95, { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] } ))
      .rejects.toThrowError(new BadRequestException('You are not authorized to add grades for this course'));
  });

  it('should throw an error if student is not enrolled in the course', async () => {
    const course = {
      id: 1,
      teacher: { id: 1 },
      students: [],
    };

    mockCourseRepo.findOne.mockResolvedValueOnce(course);

    await expect(service.addStudentGrade(1, 'student@example.com', 95, { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] }))
      .rejects.toThrowError(new NotFoundException('No student found with email: student@example.com'));
  });

  it('should edit a student grade', async () => {
    const gradeEntity = {
      id: 1,
      grade: 85,
      studentCourse: {
        course: {
          teacher: { id: 1 },
        },
      },
    };
    const teacher = { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] };

    const mockStudentCourseGradeRepo = {
      findOne: jest.fn().mockResolvedValue(gradeEntity),
      save: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: UserService, useValue: mockUserService },
        { provide: StudentCourseService, useValue: mockStudentCourseService },
        { provide: getRepositoryToken(Course), useValue: mockCourseRepo },
        { provide: getRepositoryToken(StudentCourseGrade), useValue: mockStudentCourseGradeRepo },
      ],
    }).compile();

    const serviceWithGradeRepo = module.get<CourseService>(CourseService);

    const result = await serviceWithGradeRepo.editStudentGrade(1, 90, teacher);

    expect(mockStudentCourseGradeRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['studentCourse', 'studentCourse.course', 'studentCourse.course.teacher'],
    });
    expect(gradeEntity.grade).toBe(90);
    expect(mockStudentCourseGradeRepo.save).toHaveBeenCalledWith(gradeEntity);
    expect(result).toBe(true);
  });

  it('should throw an error if trying to edit a non-existent grade', async () => {
    const mockStudentCourseGradeRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: UserService, useValue: mockUserService },
        { provide: StudentCourseService, useValue: mockStudentCourseService },
        { provide: getRepositoryToken(Course), useValue: mockCourseRepo },
        { provide: getRepositoryToken(StudentCourseGrade), useValue: mockStudentCourseGradeRepo },
      ],
    }).compile();

    const serviceWithGradeRepo = module.get<CourseService>(CourseService);

    await expect(serviceWithGradeRepo.editStudentGrade(1, 90, { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] }))
      .rejects.toThrowError(new NotFoundException('No grade found with id: 1'));
  });

  it('should delete a student grade', async () => {
    const gradeEntity = {
      id: 1,
      studentCourse: {
        course: {
          teacher: { id: 1 },
        },
      },
    };
    const teacher = { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] };

    const mockStudentCourseGradeRepo = {
      findOne: jest.fn().mockResolvedValue(gradeEntity),
      remove: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: UserService, useValue: mockUserService },
        { provide: StudentCourseService, useValue: mockStudentCourseService },
        { provide: getRepositoryToken(Course), useValue: mockCourseRepo },
        { provide: getRepositoryToken(StudentCourseGrade), useValue: mockStudentCourseGradeRepo },
      ],
    }).compile();

    const serviceWithGradeRepo = module.get<CourseService>(CourseService);

    const result = await serviceWithGradeRepo.deleteStudentGrade(1, teacher);

    expect(mockStudentCourseGradeRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['studentCourse', 'studentCourse.course', 'studentCourse.course.teacher'],
    });
    expect(mockStudentCourseGradeRepo.remove).toHaveBeenCalledWith(gradeEntity);
    expect(result).toBe(true);
  });

  it('should throw an error if trying to delete a non-existent grade', async () => {
    const mockStudentCourseGradeRepo = {
      findOne: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: UserService, useValue: mockUserService },
        { provide: StudentCourseService, useValue: mockStudentCourseService },
        { provide: getRepositoryToken(Course), useValue: mockCourseRepo },
        { provide: getRepositoryToken(StudentCourseGrade), useValue: mockStudentCourseGradeRepo },
      ],
    }).compile();

    const serviceWithGradeRepo = module.get<CourseService>(CourseService);

    await expect(serviceWithGradeRepo.deleteStudentGrade(1, { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] }))
      .rejects.toThrowError(new NotFoundException('No grade found with id: 1'));
  });

});
