import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentCourse } from '../entities/student-course.entity';
import { UserService } from '../user/user.service';
import { Course } from '../entities/course.entity';

@Injectable()
export class StudentCourseService {
  constructor(
    @InjectRepository(StudentCourse) private studentCourseRepo: Repository<StudentCourse>,
    private userService: UserService
  ) {}

  async enrollStudent(course: Course, studentEmail: string, teacherEmail: string) {
    if (course.teacher.email !== teacherEmail) {
      throw new BadRequestException('You are not authorized to enroll students in this course');
    }

    const student = await this.userService.findStudentByEmail(studentEmail);
    if (!student) {
      throw new NotFoundException(`No student found with email: ${studentEmail}`);
    }

    const existingEnrollment = await this.studentCourseRepo.findOne({
      where: { student: { id: student.id }, course: { id: course.id } },
    });

    if (existingEnrollment) {
      throw new BadRequestException(`Student is already enrolled in "${course.teacher}"`);
    }

    const enrollment = this.studentCourseRepo.create({ student, course });
    await this.studentCourseRepo.save(enrollment);

    return { message: 'Student successfully enrolled' };
  }

  async getCoursesForStudent(studentEmail: string) {
    const student = await this.userService.findStudentByEmail(studentEmail);
    if (!student) {
      throw new NotFoundException(`No student found with email: ${studentEmail}`);
    }

    const enrollments = await this.studentCourseRepo
      .createQueryBuilder('student_course')
      .leftJoinAndSelect('student_course.course', 'course')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .where('student_course.studentId = :studentId', { studentId: student.id })
      .getMany();

    return enrollments.map(enrollment => ({
      ...enrollment.course,
      teacher: {
        firstName: enrollment.course.teacher.firstName,
        lastName: enrollment.course.teacher.lastName,
        email: enrollment.course.teacher.email,
        role: enrollment.course.teacher.role,
        image: enrollment.course.teacher.image ?? process.env.DEFAULT_USER_IMAGE,
      },
    }));
  }
  
}
