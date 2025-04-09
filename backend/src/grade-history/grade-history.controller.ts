import { Controller, Get, Query, UseGuards } from '@nestjs/common';
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

@Controller('history')
export class GradeHistoryController {
  constructor(private readonly gradeHistoryService: GradeHistoryService) {}

  @Get('getGradeHistoryByStudent')
  @Roles(UserRole.Student)
  @UseGuards(AuthGuard('jwt'))
  async getGradeHistoryByStudent(@Query() query: GetGradeHistoryByStudentDto) {
    return await this.gradeHistoryService.getGradeHistoryByStudent(
      query.emailStudent,
    );
  }

  @Get('getGradeHistoryByTeacher')
  @Roles(UserRole.Teacher)
  @UseGuards(AuthGuard('jwt'))
  async getGradeHistoryByTeacher(@Query() query: GetGradeHistoryByTeacherDto) {
    return await this.gradeHistoryService.getGradeHistoryByTeacher(
      query.emailTeacher,
    );
  }
}
