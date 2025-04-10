import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentCourse } from '../entities/student-course.entity';
import { UserService } from '../user/user.service';
import { Course } from '../entities/course.entity';

@Injectable()
export class StudentCourseService {
  private readonly logger = new Logger(StudentCourseService.name);
  constructor(
    @InjectRepository(StudentCourse) private studentCourseRepo: Repository<StudentCourse>,
    private userService: UserService
  ) {}

  async enrollStudent(course: Course, studentEmail: string, teacherEmail: string) {
    this.logger.log(`Attempting to enroll student with email: ${studentEmail} in course: ${course.title} taught by ${teacherEmail}`);
    if (course.teacher.email !== teacherEmail) {
      this.logger.warn(`Unauthorized attempt to enroll student in course. Teacher email: ${teacherEmail} does not match course teacher`);
      throw new BadRequestException('You are not authorized to enroll students in this course');
    }

    const student = await this.userService.findStudentByEmail(studentEmail);
    if (!student) {
      this.logger.warn(`No student found with email: ${studentEmail}`);
      throw new NotFoundException(`No student found with email: ${studentEmail}`);
    }

    const existingEnrollment = await this.studentCourseRepo.findOne({
      where: { student: { id: student.id }, course: { id: course.id } },
    });

    if (existingEnrollment) {
      this.logger.warn(`Student with email: ${studentEmail} is already enrolled in course: ${course.title}`);
      throw new BadRequestException(`Student is already enrolled in "${course.teacher}"`);
    }

    const enrollment = this.studentCourseRepo.create({ student, course });
    await this.studentCourseRepo.save(enrollment);

    this.logger.log(`Student with email: ${studentEmail} successfully enrolled in course: ${course.title}`);
    return { message: 'Student successfully enrolled' };
  }

  async getCoursesForStudent(studentEmail: string) {
    this.logger.log(`Fetching courses for student with email: ${studentEmail}`);
    const student = await this.userService.findStudentByEmail(studentEmail);
    if (!student) {
      this.logger.warn(`No student found with email: ${studentEmail}`);
      throw new NotFoundException(`No student found with email: ${studentEmail}`);
    }

    const enrollments = await this.studentCourseRepo
      .createQueryBuilder('student_course')
      .leftJoinAndSelect('student_course.course', 'course')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .leftJoinAndSelect('student_course.grades', 'grade')
      .where('student_course.studentId = :studentId', { studentId: student.id })
      .getMany();

      this.logger.log(`Found ${enrollments.length} enrollments for student with email: ${studentEmail}`);
      return enrollments.map(enrollment => ({
      ...enrollment.course,
      teacher: {
        firstName: enrollment.course.teacher.firstName,
        lastName: enrollment.course.teacher.lastName,
        email: enrollment.course.teacher.email,
        role: enrollment.course.teacher.role,
        image: enrollment.course.teacher.image ?? process.env.DEFAULT_USER_IMAGE,
      },
      grades: enrollment.grades.filter(grade => !grade.isDeleted).map(grade => ({
        id: grade.id,
        date: grade.date,
        grade: grade.grade,
      })),
    }));
  }  
}
