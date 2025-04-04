import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { UserService } from '../user/user.service';
import { StudentCourseService } from '../student-course/student-course.service';
import { User } from 'src/entities/user.entity';

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
    return await this.courseRepo.findOne({ 
      where: { title },
      relations: ['teacher', 'students', 'students.student'],
    });
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
      relations: ['teacher', 'students', 'students.student'],
    });
  
    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      teacher: {
        firstName: course.teacher.firstName,
        lastName: course.teacher.lastName,
        email: course.teacher.email,
        role: course.teacher.role,
        image: course.teacher.image ?? process.env.DEFAULT_USER_IMAGE,
      },
      students: course.students.map(studentCourse => ({
        firstName: studentCourse.student.firstName,
        lastName: studentCourse.student.lastName,
        email: studentCourse.student.email,
        role: studentCourse.student.role,
        image: studentCourse.student.image ?? process.env.DEFAULT_USER_IMAGE,
      }))
    }));
  }
  
  async findCoursesByStudent(studentEmail: string) {
    const courses = await this.studentCourseService.getCoursesForStudent(studentEmail);
    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      teacher: {
        firstName: course.teacher.firstName,
        lastName: course.teacher.lastName,
        email: course.teacher.email,
        role: course.teacher.role,
        image: course.teacher.image ?? process.env.DEFAULT_USER_IMAGE,
      },
    }));
  }

  async getStudentsForCourse(courseTitle: string) {
    const course = await this.courseRepo.findOne({
      where: { title: courseTitle },
      relations: ['students', 'students.student'],
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
        image: student.image ?? process.env.DEFAULT_USER_IMAGE, 
      };
    });
  }

  async getCourse(id: number, user: User) {

    const course = await this.courseRepo.findOne({ 
      where: { id },
      relations: ['students', 'students.student', 'teacher'],
    });

    if (!course) {
      throw new NotFoundException(
        `No course found with id: ${id}`
      );
    }

    if (course.teacher.id !== user.id && !course.students.some(student => student.student.id !== user.id)) {
      throw new BadRequestException(
        'You are not authorized to view this course'
      );
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      teacher: {
        firstName: course.teacher.firstName,
        lastName: course.teacher.lastName,
        email: course.teacher.email,
        role: course.teacher.role,
        image: course.teacher.image ?? process.env.DEFAULT_USER_IMAGE, 
      },
      students: course.teacher.id == user.id ? course.students.map(studentCourse => ({
        firstName: studentCourse.student.firstName,
        lastName: studentCourse.student.lastName,
        email: studentCourse.student.email,
        role: studentCourse.student.role,
        image: studentCourse.student.image ?? process.env.DEFAULT_USER_IMAGE, 
      })) : undefined,
      grades: course.teacher.id == user.id ? [] : undefined,
    };
  }
}
