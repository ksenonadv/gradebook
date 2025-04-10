import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { UserService } from '../user/user.service';
import { StudentCourseService } from '../student-course/student-course.service';
import { User } from '../entities/user.entity';
import { StudentCourseGrade } from '../entities/grade.entity';
import { GradeHistoryService } from '../grade-history/grade-history.service';
import { Action } from '../entities/grade-history.entity';


@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(StudentCourseGrade) private studentCourseGradeRepo: Repository<StudentCourseGrade>,
    private userService: UserService,
    private studentCourseService: StudentCourseService,
    private gradeHistoryService: GradeHistoryService,
  ) {}

  async createCourse(title: string, description: string, teacherEmail: string) {
    this.logger.log(`Creating course: ${title} by teacher: ${teacherEmail}`);
    const teacher = await this.userService.findTeacherByEmail(teacherEmail);
    if (!teacher) {
      this.logger.warn(`Teacher not found: ${teacherEmail}`);
      throw new NotFoundException(`No teacher found with email: ${teacherEmail}`);
    }

    const existingCourse = await this.findByTitle(title);
    if (existingCourse) {
      this.logger.warn(`Course already exists: ${title}`);
      throw new BadRequestException(`A course with the title "${title}" already exists.`);
    }

    const course = this.courseRepo.create({ title, description, teacher });
    this.logger.log(`Course created successfully: ${course.id}`);
    return await this.courseRepo.save(course);
  }

  async destroyCourse(title: string, teacherEmail: string) {
    this.logger.log(`Deleting course: ${title} by teacher: ${teacherEmail}`);
    const course = await this.findByTitle(title);
    if (!course) {
      this.logger.warn(`Course not found: ${title}`);
      throw new NotFoundException(`No course found with title: "${title}"`);
    }

    if (course.teacher.email !== teacherEmail) {
      this.logger.warn(`Unauthorized delete attempt by: ${teacherEmail}`);
      throw new BadRequestException('You are not authorized to delete this course');
    }

    await this.courseRepo.remove(course);
    this.logger.log(`Course deleted successfully: ${title}`);
    return { message: 'Course successfully deleted' };
  }

  async findByTitle(title: string) {
    this.logger.debug(`Finding course by title: ${title}`);
    return await this.courseRepo.findOne({ 
      where: { title },
      relations: ['teacher', 'students', 'students.student'],
    });
  }

  async enrollStudent(courseTitle: string, studentEmail: string, teacherEmail: string) {
    this.logger.log(`Enrolling student: ${studentEmail} to course: ${courseTitle} by teacher: ${teacherEmail}`);
    const course = await this.findByTitle(courseTitle);
    if (!course) {
      this.logger.warn(`Course not found for enrollment: ${courseTitle}`);
      throw new NotFoundException(`No course found with title: "${courseTitle}"`);
    }
    return await this.studentCourseService.enrollStudent(course, studentEmail, teacherEmail);
  }

  async findCoursesByTeacher(teacherEmail: string) {
    this.logger.debug(`Finding courses for teacher: ${teacherEmail}`);
    const teacher = await this.userService.findTeacherByEmail(teacherEmail);
    if (!teacher) {
      this.logger.warn(`Teacher not found: ${teacherEmail}`);
      throw new NotFoundException(`No teacher found with email: ${teacherEmail}`);
    }
  
    const courses = await this.courseRepo.find({
      where: { teacher: { id: teacher.id } },
      relations: ['teacher', 'students', 'students.student'],
    });
  
    this.logger.log(`Found ${courses.length} courses for teacher: ${teacherEmail}`);
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
    this.logger.log(`Fetching courses for student: ${studentEmail}`);
    const courses = await this.studentCourseService.getCoursesForStudent(studentEmail);
    this.logger.log(`Found ${courses.length} courses for student: ${studentEmail}`);
    return courses;
  }

  async getStudentsForCourse(courseTitle: string) {
    this.logger.log(`Fetching students for course: ${courseTitle}`);
    const course = await this.courseRepo.findOne({
      where: { title: courseTitle },
      relations: ['students', 'students.student'],
    });

    if (!course) {
      this.logger.warn(`No course found with title: ${courseTitle}`);
      throw new NotFoundException(`No course found with title: "${courseTitle}"`);
    }

    this.logger.log(`Found ${course.students.length} students for course: ${courseTitle}`);
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

    this.logger.log(`Fetching course details for course ID: ${id} and user ID: ${user.id}`);
    const course = await this.courseRepo.findOne({ 
      where: { id },
      relations: ['students', 'students.student', 'students.grades', 'teacher'],
    });

    if (!course) {
      this.logger.warn(`No course found with ID: ${id}`);
      throw new NotFoundException(
        `No course found with id: ${id}`
      );
    }

    const isTeacher = course.teacher.id === user.id;
    const student = course.students.find(student => student.student.id == user.id);

    if (course.teacher.id !== user.id && !student) {
      this.logger.warn(`Unauthorized access attempt by user ID: ${user.id} for course ID: ${id}`);
      throw new BadRequestException(
        'You are not authorized to view this course'
      );
    }

    this.logger.log(`Course details retrieved successfully for course ID: ${id}`);
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
        grades: studentCourse.grades.map(grade => ({
          id: grade.id,
          date: grade.date,
          grade: grade.grade,
        })),
      })) : undefined,
      grades: !isTeacher ? student?.grades.filter((grade) => !grade.isDeleted) : undefined,
    };
  }

  async addStudentGrade(courseId: number, studentEmail: string, grade: number, teacher: User) {

    this.logger.log(`Adding grade for student: ${studentEmail} in course ID: ${courseId} by teacher ID: ${teacher.id}`);
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['teacher', 'students', 'students.student']
    });

    if (!course) {
      this.logger.warn(`No course found with ID: ${courseId}`);
      throw new NotFoundException(
        `No course found with id: ${courseId}`
      );
    }

    if (course.teacher.id !== teacher.id) {
      this.logger.warn(`Unauthorized grade addition attempt by teacher ID: ${teacher.id} for course ID: ${courseId}`);
      throw new BadRequestException(
        'You are not authorized to add grades for this course'
      );
    }

    const student = course.students.find(student => student.student.email === studentEmail);

    if (!student) {
      this.logger.warn(`No student found with email: ${studentEmail} in course ID: ${courseId}`);
      throw new NotFoundException(
        `No student found with email: ${studentEmail}`
      );
    }

    const grade_entity = await this.studentCourseGradeRepo.create({
      studentCourse: student,
      date: new Date(),
      grade: grade,
    });

    await this.studentCourseGradeRepo.save(grade_entity);

    this.logger.log(`Grade added successfully for student: ${studentEmail} in course: ${courseId}`);
    await this.gradeHistoryService.addGradeHistory(grade_entity, Action.Create, grade_entity.grade);

    return {
      id: grade_entity.id,
      date: grade_entity.date,
      grade: grade_entity.grade
    };
  }

  async editStudentGrade(gradeId: number, grade: number, teacher: User) {
    
    this.logger.log(`Attempting to edit grade with ID: ${gradeId} by teacher with ID: ${teacher.id}`);
    const gradeEntity = await this.studentCourseGradeRepo.findOne({
      where: { id: gradeId },
      relations: ['studentCourse', 'studentCourse.course', 'studentCourse.course.teacher'],
    });

    if (!gradeEntity) {
      this.logger.warn(`No grade found with ID: ${gradeId}`);
      throw new NotFoundException(
        `No grade found with id: ${gradeId}`
      );
    }

    if (gradeEntity.studentCourse.course.teacher.id !== teacher.id) {
      this.logger.warn(`Teacher with ID: ${teacher.id} is not authorized to edit grade ID: ${gradeId}`);
      throw new BadRequestException(
        'You are not authorized to edit this grade'
      );
    }

    await this.gradeHistoryService.editGradeHistory(gradeEntity, Action.Update, gradeEntity.grade, grade);

    gradeEntity.grade = grade;
    await this.studentCourseGradeRepo.save(gradeEntity);

    this.logger.log(`Grade with ID: ${gradeId} updated successfully by teacher with ID: ${teacher.id}`);
    return true;
  }

  async deleteStudentGrade(gradeId: number, teacher: User) {

    this.logger.log(`Attempting to delete grade with ID: ${gradeId} by teacher with ID: ${teacher.id}`);
    const grade = await this.studentCourseGradeRepo.findOne({
      where: { id: gradeId },
      relations: ['studentCourse', 'studentCourse.course', 'studentCourse.course.teacher'],
    });

    if (!grade) {
      this.logger.warn(`No grade found with ID: ${gradeId}`);
      throw new NotFoundException(
        `No grade found with id: ${gradeId}`
      );
    }

    if (grade.studentCourse.course.teacher.id !== teacher.id) {
      this.logger.warn(`Teacher with ID: ${teacher.id} is not authorized to delete grade ID: ${gradeId}`);
      throw new BadRequestException(
        'You are not authorized to delete this grade'
      );
    }

    grade.isDeleted = true;
    await this.studentCourseGradeRepo.save(grade);

    this.logger.log(`Grade with ID: ${gradeId} marked as deleted by teacher with ID: ${teacher.id}`);
    await this.gradeHistoryService.deleteGradeHistory(grade, Action.Delete, grade.grade);

    return true;
  }

  async submitGradesForCourse(courseId: number, gradesArray: Array<{ email: string, grade: number }>, teacher: User) {
    this.logger.log(`Attempting to submit grades for course ID: ${courseId} by teacher with ID: ${teacher.id}`);
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['teacher', 'students', 'students.student', 'students.grades'],
    });
  
    if (!course) {
      this.logger.warn(`No course found with ID: ${courseId}`);
      throw new NotFoundException(`Course not found`);
    }
  
    if (course.teacher.id !== teacher.id) {
      this.logger.warn(`Teacher with ID: ${teacher.id} is not authorized to submit grades for course ID: ${courseId}`);
      throw new BadRequestException('You are not authorized to submit grades for this course');
    }
  
    for (const gradeEntry of gradesArray) {
      const student = course.students.find(studentCourse => studentCourse.student.email === gradeEntry.email);
      if (!student) {
        this.logger.warn(`No student found with email: ${gradeEntry.email} in course ID: ${courseId}`);
        throw new NotFoundException(`No student found with email: ${gradeEntry.email}`);
      }
  
      const grade = this.studentCourseGradeRepo.create({
        studentCourse: student,
        date: new Date(),
        grade: gradeEntry.grade,
      });
  
      await this.studentCourseGradeRepo.save(grade);
      this.logger.log(`Grade submitted for student: ${gradeEntry.email} in course ID: ${courseId}`);
    }
    
    this.logger.log(`Grades successfully submitted for course ID: ${courseId} by teacher with ID: ${teacher.id}`);
    return { message: 'Grades successfully submitted' };
  }  

}
