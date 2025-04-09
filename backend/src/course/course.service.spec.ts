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
import { User } from '../entities/user.entity';
import { StudentCourse } from '../entities/student-course.entity';
import { GradeHistoryService } from '../grade-history/grade-history.service';

describe('CourseService', () => {
  let service: CourseService;
  let userService: UserService;
  let studentCourseService: StudentCourseService;
  let courseRepo: Repository<Course>;
  let gradeHistoryService: GradeHistoryService;

  const mockUserService = {
    findTeacherByEmail: jest.fn().mockResolvedValue({ email: 'teacher@example.com' }),
  };

  const mockGradeHistoryService = {
    addGradeHistory: jest.fn(),
    editGradeHistory: jest.fn(),
    deleteGradeHistory: jest.fn(),
  };

  const mockStudentCourseService = {
    enrollStudent: jest.fn(),
  };

  const mockCourseRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockResolvedValue(true),
    findOne: jest.fn(),
    remove: jest.fn().mockResolvedValue(true),
  };

  const mockStudentCourseGradeRepo = {
    create: jest.fn().mockReturnValue({}),
    save: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue(null),
    remove: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: UserService, useValue: mockUserService },
        { provide: GradeHistoryService, useValue: mockGradeHistoryService },
        { provide: StudentCourseService, useValue: mockStudentCourseService },
        { provide: getRepositoryToken(Course), useValue: mockCourseRepo },
        { provide: getRepositoryToken(StudentCourseGrade), useValue: mockStudentCourseGradeRepo },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    userService = module.get<UserService>(UserService);
    studentCourseService = module.get<StudentCourseService>(StudentCourseService);
    courseRepo = module.get<Repository<Course>>(getRepositoryToken(Course));
    gradeHistoryService = module.get<GradeHistoryService>(GradeHistoryService);
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

  it('should throw an error if trying to add a grade for a non-existent course', async () => {
    mockCourseRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.addStudentGrade(1, 'student@example.com', 95, { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] }))
      .rejects.toThrow(new NotFoundException('No course found with id: 1'));
  });

  it('should throw an error if teacher is not authorized to add a grade', async () => {
    const course = {
      id: 1,
      teacher: { id: 2 },
      students: [{ student: { email: 'student@example.com' } }],
    };

    mockCourseRepo.findOne.mockResolvedValueOnce(course);

    await expect(service.addStudentGrade(1, 'student@example.com', 95, { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] } ))
      .rejects.toThrow(new BadRequestException('You are not authorized to add grades for this course'));
  });

  it('should throw an error if student is not enrolled in the course', async () => {
    const course = {
      id: 1,
      teacher: { id: 1 },
      students: [],
    };

    mockCourseRepo.findOne.mockResolvedValueOnce(course);

    await expect(
      service.addStudentGrade(1, 'student@example.com', 95, {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        image: '',
        role: UserRole.Teacher,
        email: 'teacher@test.ro',
        password: '',
        courses: [],
        enrolledCourses: [],
      })
    ).rejects.toThrow(new NotFoundException('No student found with email: student@example.com'));
  });

  it('should add a grade for a student', async () => {
    const course = {
      id: 1,
      teacher: { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] },
      students: [{ student: { email: 'student@example.com' } }],
    };
    const gradeEntity = { id: 1, date: new Date(), grade: 95 };

    mockCourseRepo.findOne.mockResolvedValueOnce(course);
    mockStudentCourseGradeRepo.create.mockReturnValue(gradeEntity);
    mockStudentCourseGradeRepo.save.mockResolvedValue(gradeEntity);

    const result = await service.addStudentGrade(1, 'student@example.com', 95, course.teacher);

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
  
    await expect(service.addStudentGrade(1, 'student@example.com', 95, {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      image: '',
      role: UserRole.Teacher,
      email: 'teacher@test.ro',
      password: '', 
      courses: [], 
      enrolledCourses: []
    }))
    .rejects.toThrowError(new NotFoundException('No course found with id: 1'));
  });
  
  it('should throw an error if teacher is not authorized to add a grade', async () => {
    const course = {
      id: 1,
      teacher: { id: 2 },
      students: [{ student: { email: 'student@example.com' } }],
    };

    mockCourseRepo.findOne.mockResolvedValueOnce(course);

    await expect(service.addStudentGrade(1, 'student@example.com', 95, { id: 1, firstName: 'John', lastName: 'Doe', image: '', role: UserRole.Teacher, email: 'teacher@test.ro', password: '', courses: [], enrolledCourses: [] }))
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

  it('should successfully submit grades for enrolled students', async () => {
    const studentEmail = 'student@example.com';
    const grade = 10;

    const course = new Course();
    course.id = 1;
    course.teacher = new User();
    course.teacher.id = 1;
    course.teacher.email = 'teacher@example.com';
    course.students = [
      {
        id: 1,
        student: { email: studentEmail } as User,
        studentCourse: {},
        grades: [],
        course: course,
      } as StudentCourse,
    ];

    const studentCourse = course.students[0];
    const teacher = new User();
    teacher.id = 1;
    teacher.email = 'teacher@example.com';

    mockStudentCourseGradeRepo.create.mockImplementation(({ studentCourse, grade }) => ({
      studentCourse,
      grade,
      date: new Date(),
    }));
    mockStudentCourseGradeRepo.save.mockResolvedValue({});
    mockCourseRepo.findOne.mockResolvedValue(course);

    const result = await service.submitGradesForCourse(1, [{ email: studentEmail, grade }], teacher);

    expect(result).toEqual({ message: 'Grades successfully submitted' });
    expect(mockStudentCourseGradeRepo.save).toHaveBeenCalled();
    expect(mockCourseRepo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['teacher', 'students', 'students.student', 'students.grades'],
    });
  });
});