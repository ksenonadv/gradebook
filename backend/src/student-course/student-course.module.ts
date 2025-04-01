import { Module } from '@nestjs/common';
import { StudentCourseService } from './student-course.service';
import { StudentCourseController } from './student-course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentCourse } from '../entities/student-course.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([StudentCourse]),
      UserModule
  ],
  controllers: [StudentCourseController],
  providers: [StudentCourseService],
  exports: [StudentCourseService]
})
export class StudentCourseModule {}
