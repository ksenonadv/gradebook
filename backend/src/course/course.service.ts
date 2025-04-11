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

/**
 * Service responsible for managing course-related operations in the gradebook system.
 * Handles course creation, student enrollment, grade management, and course information retrieval.
 */
@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  /**
   * Creates an instance of CourseService.
   * 
   * @param courseRepo - Repository for Course entities
   * @param studentCourseGradeRepo - Repository for StudentCourseGrade entities
   * @param userService - Service for user-related operations
   * @param studentCourseService - Service for student-course relationship operations
   * @param gradeHistoryService - Service for tracking grade history changes
   */
  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    @InjectRepository(StudentCourseGrade) private studentCourseGradeRepo: Repository<StudentCourseGrade>,
    private userService: UserService,
    private studentCourseService: StudentCourseService,
    private gradeHistoryService: GradeHistoryService,
  ) {}

  /**
   * Creates a new course with the specified teacher as the owner.
   * 
   * @param title - The title of the course
   * @param description - The description of the course
   * @param teacherEmail - The email of the teacher creating the course
   * @returns The newly created course entity
   * @throws NotFoundException if the teacher is not found
   * @throws BadRequestException if a course with the same title already exists
   */
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

  /**
   * Deletes a course from the system.
   * Only the teacher who created the course is authorized to delete it.
   * 
   * @param title - The title of the course to delete
   * @param teacherEmail - The email of the teacher attempting to delete the course
   * @returns A success message upon successful deletion
   * @throws NotFoundException if the course is not found
   * @throws BadRequestException if the user is not authorized to delete the course
   */
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

  /**
   * Finds a course by its title, including related teacher and student information.
   * 
   * @param title - The title of the course to find
   * @returns The course entity if found, otherwise null
   */
  async findByTitle(title: string) {
    this.logger.debug(`Finding course by title: ${title}`);
    return await this.courseRepo.findOne({ 
      where: { title },
      relations: ['teacher', 'students', 'students.student'],
    });
  }

  /**
   * Enrolls a student in a specific course.
   * 
   * @param courseTitle - The title of the course
   * @param studentEmail - The email of the student to enroll
   * @param teacherEmail - The email of the teacher authorizing the enrollment
   * @returns The result of the enrollment operation
   * @throws NotFoundException if the course is not found
   */
  async enrollStudent(courseTitle: string, studentEmail: string, teacherEmail: string) {
    this.logger.log(`Enrolling student: ${studentEmail} to course: ${courseTitle} by teacher: ${teacherEmail}`);
    const course = await this.findByTitle(courseTitle);
    if (!course) {
      this.logger.warn(`Course not found for enrollment: ${courseTitle}`);
      throw new NotFoundException(`No course found with title: "${courseTitle}"`);
    }
    return await this.studentCourseService.enrollStudent(course, studentEmail, teacherEmail);
  }

  /**
   * Retrieves all courses taught by a specific teacher.
   * 
   * @param teacherEmail - The email of the teacher
   * @returns An array of course information objects
   * @throws NotFoundException if the teacher is not found
   */
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
  
  /**
   * Retrieves all courses in which a specific student is enrolled.
   * 
   * @param studentEmail - The email of the student
   * @returns An array of course information objects
   */
  async findCoursesByStudent(studentEmail: string) {
    this.logger.log(`Fetching courses for student: ${studentEmail}`);
    const courses = await this.studentCourseService.getCoursesForStudent(studentEmail);
    this.logger.log(`Found ${courses.length} courses for student: ${studentEmail}`);
    return courses;
  }

  /**
   * Retrieves the list of students enrolled in a specific course.
   * 
   * @param courseTitle - The title of the course
   * @returns An array of student information objects
   * @throws NotFoundException if the course is not found
   */
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

  /**
   * Retrieves detailed information about a specific course, with access control based on user role.
   * Teachers see all student information and grades, while students only see their own grades.
   * 
   * @param id - The ID of the course to retrieve
   * @param user - The user requesting the course information
   * @returns Course details including teacher info and conditionally student info and grades
   * @throws NotFoundException if the course is not found
   * @throws BadRequestException if the user is not authorized to view the course
   */
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

  /**
   * Adds a grade for a specific student in a course.
   * Only the teacher of the course can add grades.
   * 
   * @param courseId - The ID of the course
   * @param studentEmail - The email of the student receiving the grade
   * @param grade - The numeric grade value
   * @param teacher - The teacher adding the grade
   * @returns The newly created grade object
   * @throws NotFoundException if the course or student is not found
   * @throws BadRequestException if the teacher is not authorized to add grades
   */
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

  /**
   * Edits an existing grade for a student.
   * Only the teacher of the course can edit grades.
   * The change is recorded in grade history.
   * 
   * @param gradeId - The ID of the grade to edit
   * @param grade - The new grade value
   * @param teacher - The teacher editing the grade
   * @returns True if the grade was successfully updated
   * @throws NotFoundException if the grade is not found
   * @throws BadRequestException if the teacher is not authorized to edit the grade
   */
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

  /**
   * Marks a grade as deleted (soft delete).
   * Only the teacher of the course can delete grades.
   * The deletion is recorded in grade history.
   * 
   * @param gradeId - The ID of the grade to delete
   * @param teacher - The teacher deleting the grade
   * @returns True if the grade was successfully marked as deleted
   * @throws NotFoundException if the grade is not found
   * @throws BadRequestException if the teacher is not authorized to delete the grade
   */
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

  /**
   * Submits multiple grades for students in a course at once.
   * Only the teacher of the course can submit grades.
   * 
   * @param courseId - The ID of the course
   * @param gradesArray - Array of objects containing student emails and their grades
   * @param teacher - The teacher submitting the grades
   * @returns A success message upon successful submission
   * @throws NotFoundException if the course or a student is not found
   * @throws BadRequestException if the teacher is not authorized to submit grades
   */
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
