import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../entities/course.entity';
import { UserModule } from '../user/user.module';
import { StudentCourseModule } from '../student-course/student-course.module';
import { StudentCourseGrade } from '../entities/grade.entity';
import { GradeHistoryModule } from '../grade-history/grade-history.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([Course, StudentCourseGrade]),
      UserModule,
      StudentCourseModule,
      GradeHistoryModule
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService]
})
export class CourseModule {}
