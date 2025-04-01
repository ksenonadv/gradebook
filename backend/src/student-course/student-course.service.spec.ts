import { Test, TestingModule } from '@nestjs/testing';
import { StudentCourseService } from './student-course.service';
import { UserService } from '../user/user.service';
import { CourseService } from '../course/course.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StudentCourse } from '../entities/student-course.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('StudentCourseService', () => {
  let service: StudentCourseService;
  let userService: UserService;
  let courseService: CourseService;
  let studentCourseRepo: Repository<StudentCourse>;

  const mockUserService = {
    findStudentByEmail: jest.fn().mockResolvedValue({ email: 'student@example.com' }),
  };

  const mockCourseService = {
    findByTitle: jest.fn().mockResolvedValue({ title: 'Course Title', teacher: { email: 'teacher@example.com' } }),
  };

  const mockStudentCourseRepo = {
    create: jest.fn().mockImplementation(({ student, course }) => ({
      student: { email: student.email },
      course: { title: course.title, teacher: { email: course.teacher.email } },
    })),
    save: jest.fn().mockResolvedValue(true),
    findOne: jest.fn().mockResolvedValue(null),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentCourseService,
        { provide: UserService, useValue: mockUserService },
        { provide: CourseService, useValue: mockCourseService },
        { provide: getRepositoryToken(StudentCourse), useValue: mockStudentCourseRepo },
      ],
    }).compile();

    service = module.get<StudentCourseService>(StudentCourseService);
    userService = module.get<UserService>(UserService);
    courseService = module.get<CourseService>(CourseService);
    studentCourseRepo = module.get<Repository<StudentCourse>>(getRepositoryToken(StudentCourse));
  });

  it('should enroll a student into a course', async () => {
    const course = await mockCourseService.findByTitle('Course Title');
    const result = await service.enrollStudent(course, 'student@example.com', 'teacher@example.com');

    expect(mockCourseService.findByTitle).toHaveBeenCalledWith('Course Title');
    expect(mockUserService.findStudentByEmail).toHaveBeenCalledWith('student@example.com');
    expect(mockStudentCourseRepo.findOne).toHaveBeenCalled();
    expect(mockStudentCourseRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        student: expect.objectContaining({ email: 'student@example.com' }),
        course: expect.objectContaining({ title: 'Course Title', teacher: expect.objectContaining({ email: 'teacher@example.com' }) }),
      })
    );
    expect(mockStudentCourseRepo.save).toHaveBeenCalled();
    expect(result).toEqual({ message: 'Student successfully enrolled' });
  });

  it('should throw an error if student is already enrolled', async () => {
    mockStudentCourseRepo.findOne.mockResolvedValueOnce({});

    const course = await mockCourseService.findByTitle('Course Title');
    await expect(
      service.enrollStudent(course, 'student@example.com', 'teacher@example.com')
    ).rejects.toThrow(BadRequestException);
  });
});
