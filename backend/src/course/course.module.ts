import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../entities/course.entity';
import { UserModule } from '../user/user.module';
import { StudentCourseModule } from '../student-course/student-course.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([Course]),
      UserModule,
      StudentCourseModule
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService]
})
export class CourseModule {}
