import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeHistory } from '../entities/grade-history.entity';
import { GradeHistoryService } from './grade-history.service';
import { StudentCourseGrade } from '../entities/grade.entity';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GradeHistory, StudentCourseGrade]),
    UserModule,
  ],
  providers: [GradeHistoryService],
  exports: [GradeHistoryService],
})
export class GradeHistoryModule {}