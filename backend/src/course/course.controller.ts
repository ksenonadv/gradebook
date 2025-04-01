import { Controller, Post, Delete, Body } from '@nestjs/common';
import { CourseService } from './course.service';
import { IsEmail, IsNotEmpty } from 'class-validator';

class CreateCourseDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsEmail()
  teacherEmail: string;
}

class DestroyCourseDto {
  @IsNotEmpty()
  title: string;

  @IsEmail()
  teacherEmail: string;
}

class EnrollStudentDto {
  @IsNotEmpty()
  courseTitle: string;

  @IsEmail()
  studentEmail: string;

  @IsEmail()
  teacherEmail: string;
}

class FindCoursesByTeacherDto {
  @IsEmail()
  teacherEmail: string;
}

class FindCoursesByStudentDto {
  @IsEmail()
  studentEmail: string;
}

class GetStudentsForCourseDto {
  @IsNotEmpty()
  courseTitle: string;
}

@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
  ) {}

  @Post('create')
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return await this.courseService.createCourse(
      createCourseDto.title, 
      createCourseDto.description, 
      createCourseDto.teacherEmail
    );
  }

  @Delete('delete')
  async destroyCourse(@Body() destroyCourseDto: DestroyCourseDto) {
    return await this.courseService.destroyCourse(
      destroyCourseDto.title, 
      destroyCourseDto.teacherEmail
    );
  }

  @Post('enroll')
  async enrollStudent(@Body() enrollStudentDto: EnrollStudentDto) {
    return await this.courseService.enrollStudent(
      enrollStudentDto.courseTitle, 
      enrollStudentDto.studentEmail, 
      enrollStudentDto.teacherEmail
    );
  }

  @Post('findByTeacher')
  async findCoursesByTeacher(@Body() findCoursesByTeacherDto: FindCoursesByTeacherDto) {
    return await this.courseService.findCoursesByTeacher(findCoursesByTeacherDto.teacherEmail);
  }

  @Post('findByStudent')
  async findCoursesByStudent(@Body() findCoursesByStudentDto: FindCoursesByStudentDto) {
    return await this.courseService.findCoursesByStudent(findCoursesByStudentDto.studentEmail);
  }

  @Post('getStudentsForCourse')
  async getStudentsForCourse(@Body() getStudentsForCourseDto: GetStudentsForCourseDto) {
    return await this.courseService.getStudentsForCourse(getStudentsForCourseDto.courseTitle);
  }
}