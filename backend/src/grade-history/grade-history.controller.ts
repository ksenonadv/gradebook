import { Body, Controller, Get, UseGuards } from '@nestjs/common';
import { GradeHistoryService } from './grade-history.service';
import { Roles } from '../guards/role.guard';
import { UserRole } from '../entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsNotEmpty } from 'class-validator';

class GetGradeHistoryByStudentDto {
  @IsNotEmpty()
  @IsEmail()
  emailStudent: string;
}

class GetGradeHistoryByTeacherDto {
  @IsNotEmpty()
  @IsEmail()
  emailTeacher: string;
}

@Controller('grade-history')
export class GradeHistoryController {
  constructor(private readonly gradeHistoryService: GradeHistoryService) {
  }

  @Get('getGradeHistoryByStudent')
  @Roles(UserRole.Student)
  @UseGuards(AuthGuard('jwt'))
  async getGradeHistoryByStudent(@Body() body: GetGradeHistoryByStudentDto) {
      return await this.gradeHistoryService.getGradeHistoryByStudent(
        body.emailStudent,
      );
  }

  @Get('getGradeHistoryByTeacher')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async getGradeHistoryByTeacher(@Body() body: GetGradeHistoryByTeacherDto) {
      return await this.gradeHistoryService.getGradeHistoryByTeacher(
        body.emailTeacher,
      );
  }
}
