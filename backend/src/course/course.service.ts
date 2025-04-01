import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { UserService } from '../user/user.service';
import { StudentCourseService } from '../student-course/student-course.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    private userService: UserService,
    private studentCourseService: StudentCourseService,
  ) {}

  async createCourse(title: string, description: string, teacherEmail: string) {
    const teacher = await this.userService.findTeacherByEmail(teacherEmail);
    if (!teacher) {
      throw new NotFoundException(`No teacher found with email: ${teacherEmail}`);
    }

    const existingCourse = await this.findByTitle(title);
    if (existingCourse) {
      throw new BadRequestException(`A course with the title "${title}" already exists.`);
    }

    const course = this.courseRepo.create({ title, description, teacher });
    return await this.courseRepo.save(course);
  }

  async destroyCourse(title: string, teacherEmail: string) {
    const course = await this.findByTitle(title);
    if (!course) {
      throw new NotFoundException(`No course found with title: "${title}"`);
    }

    if (course.teacher.email !== teacherEmail) {
      throw new BadRequestException('You are not authorized to delete this course');
    }

    await this.courseRepo.remove(course);
    return { message: 'Course successfully deleted' };
  }

  async findByTitle(title: string) {
    return await this.courseRepo.findOne({ where: { title } });
  }

  async enrollStudent(courseTitle: string, studentEmail: string, teacherEmail: string) {
    const course = await this.findByTitle(courseTitle);
    if (!course) {
      throw new NotFoundException(`No course found with title: "${courseTitle}"`);
    }
    return await this.studentCourseService.enrollStudent(course, studentEmail, teacherEmail);
  }

  async findCoursesByTeacher(teacherEmail: string) {
    const teacher = await this.userService.findTeacherByEmail(teacherEmail);
    if (!teacher) {
      throw new NotFoundException(`No teacher found with email: ${teacherEmail}`);
    }
  
    const courses = await this.courseRepo.find({
      where: { teacher: { id: teacher.id } },
    });
  
    return courses;
  }
  
  async findCoursesByStudent(studentEmail: string) {
    return await this.studentCourseService.getCoursesForStudent(studentEmail);
  }

  async getStudentsForCourse(courseTitle: string) {
    const course = await this.courseRepo.findOne({
      where: { title: courseTitle },
      relations: ['students'],
    });

    if (!course) {
      throw new NotFoundException(`No course found with title: "${courseTitle}"`);
    }

    return course.students.map(studentCourse => {
      const student = studentCourse.student;

      return {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
        role: student.role,
        enrolledCourses: student.enrolledCourses,
        image: student.image ?? process.env.DEFAULT_USER_IMAGE, 
      };
    });
  }
}
