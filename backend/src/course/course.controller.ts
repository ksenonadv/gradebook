import { Controller, Post, Delete, Body, Req, UseGuards, UsePipes } from '@nestjs/common';
import { CourseService } from './course.service';
import { IsArray, IsEmail, IsNotEmpty, IsNumber, Max, Min, ValidateNested } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../guards/role.guard';
import { UserRole } from '../entities/user.entity';
import { Type } from 'class-transformer';

/**
 * Data transfer object for course creation requests.
 */
class CreateCourseDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsEmail()
  teacherEmail: string;
}

/**
 * Data transfer object for course deletion requests.
 */
class DestroyCourseDto {
  @IsNotEmpty()
  title: string;

  @IsEmail()
  teacherEmail: string;
}

/**
 * Data transfer object for student enrollment requests.
 */
class EnrollStudentDto {
  @IsNotEmpty()
  courseTitle: string;

  @IsEmail()
  studentEmail: string;

  @IsEmail()
  teacherEmail: string;
}

/**
 * Data transfer object for searching courses by teacher.
 */
class FindCoursesByTeacherDto {
  @IsEmail()
  teacherEmail: string;
}

/**
 * Data transfer object for searching courses by student.
 */
class FindCoursesByStudentDto {
  @IsEmail()
  studentEmail: string;
}

/**
 * Data transfer object for retrieving students enrolled in a course.
 */
class GetStudentsForCourseDto {
  @IsNotEmpty()
  courseTitle: string;
}

/**
 * Data transfer object for adding a grade to a student.
 */
class AddStudentGradeDto {
  @IsNotEmpty()
  courseId: number;

  @IsEmail()
  studentEmail: string;

  @IsNotEmpty()
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: 0,
  })
  @Min(1, { message: 'Grade must be at least 1.' })
  @Max(10, { message: 'Grade cannot exceed 10.' })
  grade: number;
}

/**
 * Data transfer object for deleting a student grade.
 */
class DeleteStudentGradeDto {
  @IsNotEmpty()
  id: number;
}

/**
 * Data transfer object for editing a student grade.
 */
class EditStudentGradeDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: 0,
  })
  @Min(1)
  @Max(10)
  grade: number;
}

/**
 * Data transfer object for a single grade entry in batch submission.
 */
class GradeDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumber({
    allowInfinity: false,
    allowNaN: false,
    maxDecimalPlaces: 0,
  })
  @Min(1, { message: 'Grade must be at least 1.' })
  @Max(10, { message: 'Grade cannot exceed 10.' })
  grade: number;
}

/**
 * Data transfer object for submitting multiple grades at once.
 */
class SubmitGradesDto {
  @IsNotEmpty()
  @IsNumber()
  courseId: number;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GradeDto)
  grades: GradeDto[];
}

/**
 * Controller responsible for handling all course-related HTTP requests.
 * Provides endpoints for course management, student enrollment, and grade operations.
 */
@Controller('course')
export class CourseController {
  /**
   * Creates an instance of CourseController.
   * 
   * @param courseService - Service for handling course-related business logic
   */
  constructor(
    private readonly courseService: CourseService,
  ) {}

  /**
   * Creates a new course.
   * Only accessible to users with Teacher role.
   * 
   * @param createCourseDto - Contains course title, description, and teacher email
   * @returns The newly created course entity
   */
  @Post('create')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return await this.courseService.createCourse(
      createCourseDto.title, 
      createCourseDto.description, 
      createCourseDto.teacherEmail
    );
  }

  /**
   * Deletes an existing course.
   * Only accessible to users with Teacher role who own the course.
   * 
   * @param destroyCourseDto - Contains course title and teacher email
   * @returns A success message upon successful deletion
   */
  @Delete('delete')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async destroyCourse(@Body() destroyCourseDto: DestroyCourseDto) {
    return await this.courseService.destroyCourse(
      destroyCourseDto.title, 
      destroyCourseDto.teacherEmail
    );
  }

  /**
   * Enrolls a student in a course.
   * Only accessible to users with Teacher role.
   * 
   * @param enrollStudentDto - Contains course title, student email, and teacher email
   * @returns A success message upon successful enrollment
   */
  @Post('enroll')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async enrollStudent(@Body() enrollStudentDto: EnrollStudentDto) {
    return await this.courseService.enrollStudent(
      enrollStudentDto.courseTitle, 
      enrollStudentDto.studentEmail, 
      enrollStudentDto.teacherEmail
    );
  }

  /**
   * Retrieves all courses taught by a specific teacher.
   * Protected by JWT authentication.
   * 
   * @param findCoursesByTeacherDto - Contains the teacher's email
   * @returns An array of courses taught by the specified teacher
   */
  @Post('findByTeacher')
  @UseGuards(AuthGuard('jwt'))
  async findCoursesByTeacher(@Body() findCoursesByTeacherDto: FindCoursesByTeacherDto) {
    return await this.courseService.findCoursesByTeacher(findCoursesByTeacherDto.teacherEmail);
  }

  /**
   * Retrieves all courses in which a specific student is enrolled.
   * Protected by JWT authentication.
   * 
   * @param findCoursesByStudentDto - Contains the student's email
   * @returns An array of courses in which the student is enrolled
   */
  @Post('findByStudent')
  @UseGuards(AuthGuard('jwt'))
  async findCoursesByStudent(@Body() findCoursesByStudentDto: FindCoursesByStudentDto) {
    return await this.courseService.findCoursesByStudent(findCoursesByStudentDto.studentEmail);
  }

  /**
   * Retrieves the list of students enrolled in a specific course.
   * Protected by JWT authentication.
   * 
   * @param getStudentsForCourseDto - Contains the course title
   * @returns An array of students enrolled in the specified course
   */
  @Post('getStudentsForCourse')
  @UseGuards(AuthGuard('jwt'))
  async getStudentsForCourse(@Body() getStudentsForCourseDto: GetStudentsForCourseDto) {
    return await this.courseService.getStudentsForCourse(getStudentsForCourseDto.courseTitle);
  }

  /**
   * Retrieves detailed information about a specific course.
   * Access control is handled in the service based on the user's role.
   * Protected by JWT authentication.
   * 
   * @param req - The HTTP request containing the authenticated user
   * @param id - The ID of the course to retrieve
   * @returns Detailed information about the course, including teacher info and conditionally students/grades
   */
  @Post('getCourse')
  @UseGuards(AuthGuard('jwt'))
  async getCourse(@Req() req: any, @Body('id') id: number) {
    return await this.courseService.getCourse(
      id,
      req.user
    );
  }

  /**
   * Adds a grade for a student in a course.
   * Only accessible to users with Teacher role.
   * Protected by JWT authentication.
   * 
   * @param req - The HTTP request containing the authenticated user (teacher)
   * @param addStudentGradeDto - Contains course ID, student email, and grade value
   * @returns The newly created grade object
   */
  @Post('addStudentGrade')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async addStudentGrade(@Req() req: any, @Body() addStudentGradeDto: AddStudentGradeDto) {
    return await this.courseService.addStudentGrade(
      addStudentGradeDto.courseId,
      addStudentGradeDto.studentEmail,
      addStudentGradeDto.grade,
      req.user,
    );
  }

  /**
   * Edits an existing grade for a student.
   * Only accessible to users with Teacher role who own the course.
   * Protected by JWT authentication.
   * 
   * @param req - The HTTP request containing the authenticated user (teacher)
   * @param dto - Contains grade ID and the new grade value
   * @returns A boolean indicating success
   */
  @Post('editStudentGrade')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async editStudentGrade(@Req() req: any, @Body() dto: EditStudentGradeDto) {
    return await this.courseService.editStudentGrade(
      dto.id,
      dto.grade,
      req.user
    );
  }

  /**
   * Deletes (soft delete) an existing grade for a student.
   * Only accessible to users with Teacher role who own the course.
   * Protected by JWT authentication.
   * 
   * @param req - The HTTP request containing the authenticated user (teacher)
   * @param dto - Contains the grade ID to delete
   * @returns A boolean indicating success
   */
  @Post('deleteStudentGrade')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async deleteStudentGrade(@Req() req: any, @Body() dto: DeleteStudentGradeDto) {
    return await this.courseService.deleteStudentGrade(
      dto.id,
      req.user
    );
  }

  /**
   * Submits multiple grades for students in a course at once.
   * Only accessible to users with Teacher role who own the course.
   * Protected by JWT authentication.
   * 
   * @param req - The HTTP request containing the authenticated user (teacher)
   * @param submitGradesDto - Contains course ID and an array of student emails with grades
   * @returns A success message upon successful submission
   */
  @Post('submitGrades')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async submitGrades(@Req() req: any, @Body() submitGradesDto: SubmitGradesDto) {
    return await this.courseService.submitGradesForCourse(
      submitGradesDto.courseId,
      submitGradesDto.grades,
      req.user
    );
  }
}