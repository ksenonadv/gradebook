import { Controller, Post, Delete, Body, Req, UseGuards } from '@nestjs/common';
import { CourseService } from './course.service';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/guards/role.guard';
import { UserRole } from 'src/entities/user.entity';

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

class AddStudentGradeDto {
  @IsNotEmpty()
  courseId: number;

  @IsEmail()
  studentEmail: string;

  @IsNotEmpty()
  grade: number;
}

class DeleteStudentGradeDto {
  @IsNotEmpty()
  id: number;
}

class EditStudentGradeDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  grade: number;
}

@Controller('course')
export class CourseController {
  constructor(
    private readonly courseService: CourseService,
  ) {}

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

  @Delete('delete')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async destroyCourse(@Body() destroyCourseDto: DestroyCourseDto) {
    return await this.courseService.destroyCourse(
      destroyCourseDto.title, 
      destroyCourseDto.teacherEmail
    );
  }

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

  @Post('deleteStudentGrade')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async deleteStudentGrade(@Req() req: any, @Body() dto: DeleteStudentGradeDto) {
    return await this.courseService.deleteStudentGrade(
      dto.id,
      req.user
    );
  }

}