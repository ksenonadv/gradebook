import { Controller, Post, Delete, Body, Req, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';

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
  @UseGuards(AuthGuard('jwt'))
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return await this.courseService.createCourse(
      createCourseDto.title, 
      createCourseDto.description, 
      createCourseDto.teacherEmail
    );
  }

  @Delete('delete')
  @UseGuards(AuthGuard('jwt'))
  async destroyCourse(@Body() destroyCourseDto: DestroyCourseDto) {
    return await this.courseService.destroyCourse(
      destroyCourseDto.title, 
      destroyCourseDto.teacherEmail
    );
  }

  @Post('enroll')
  @UseGuards(AuthGuard('jwt'))
  async enrollStudent(@Body() enrollStudentDto: EnrollStudentDto) {
    return await this.courseService.enrollStudent(
      enrollStudentDto.courseTitle, 
      enrollStudentDto.studentEmail, 
      enrollStudentDto.teacherEmail
    );
  }

  @Post('findByTeacher')
  @UseGuards(AuthGuard('jwt'))
  async findCoursesByTeacher(@Body() findCoursesByTeacherDto: FindCoursesByTeacherDto) {
    return await this.courseService.findCoursesByTeacher(findCoursesByTeacherDto.teacherEmail);
  }

  @Post('findByStudent')
  @UseGuards(AuthGuard('jwt'))
  async findCoursesByStudent(@Body() findCoursesByStudentDto: FindCoursesByStudentDto) {
    return await this.courseService.findCoursesByStudent(findCoursesByStudentDto.studentEmail);
  }

  @Post('getStudentsForCourse')
  @UseGuards(AuthGuard('jwt'))
  async getStudentsForCourse(@Body() getStudentsForCourseDto: GetStudentsForCourseDto) {
    return await this.courseService.getStudentsForCourse(getStudentsForCourseDto.courseTitle);
  }

  @Post('getCourse')
  @UseGuards(AuthGuard('jwt'))
  async getCourse(@Req() req: any, @Body('id') id: number) {
    return await this.courseService.getCourse(
      id,
      req.user
    );
  }
}