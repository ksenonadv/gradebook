import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeHistory } from '../entities/grade-history.entity';
import { GradeHistoryService } from './grade-history.service';
import { StudentCourseGrade } from '../entities/grade.entity';
import { UserModule } from '../user/user.module';
import { GradeHistoryController } from './grade-history.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([GradeHistory, StudentCourseGrade]),
    UserModule,
  ],
  providers: [GradeHistoryService],
  exports: [GradeHistoryService],
  controllers: [GradeHistoryController],
})
export class GradeHistoryModule {}