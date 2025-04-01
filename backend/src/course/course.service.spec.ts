import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { UserService } from '../user/user.service';
import { StudentCourseService } from '../student-course/student-course.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Course } from '../entities/course.entity';
import { NotFoundException } from '@nestjs/common';

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
});
