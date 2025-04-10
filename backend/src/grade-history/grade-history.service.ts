import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Action, GradeHistory } from '../entities/grade-history.entity';
import { StudentCourseGrade } from '../entities/grade.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class GradeHistoryService {    
    private readonly logger = new Logger(GradeHistoryService.name);

    constructor(
        @InjectRepository(GradeHistory) private readonly gradeHistoryRepository: Repository<GradeHistory>,
        private userService: UserService
      ) {}

    async addGradeHistory(grade: StudentCourseGrade, action: Action, newValue: number){
      this.logger.log(`Adding grade history for action: ${action}, new grade value: ${newValue}`);
      const gradeHistory = this.gradeHistoryRepository.create({
            studentCourseGrade: grade,
            action,
            newValue,
            date: new Date(),
        });
        await this.gradeHistoryRepository.save(gradeHistory);
    }

    async editGradeHistory(grade: StudentCourseGrade, action: Action, oldValue: number, newValue: number){
      this.logger.log(`Editing grade history for action: ${action}, old grade value: ${oldValue}, new grade value: ${newValue}`);
      const gradeHistory = this.gradeHistoryRepository.create({
            studentCourseGrade: grade,
            action,
            oldValue,
            newValue,
            date: new Date(),
        });
        await this.gradeHistoryRepository.save(gradeHistory);
    }

    async deleteGradeHistory(grade: StudentCourseGrade, action: Action, oldValue: number){   
      this.logger.log(`Deleting grade history for action: ${action}, old grade value: ${oldValue}`);
      const gradeHistory = this.gradeHistoryRepository.create({
            studentCourseGrade: grade,
            action,
            oldValue,
            date: new Date(),
        });
        await this.gradeHistoryRepository.save(gradeHistory);
    }

    async getGradeHistoryByStudent(studentEmail: string) {
      this.logger.log(`Fetching grade history for student with email: ${studentEmail}`);
      const student = await this.userService.findStudentWithRelations({
          where: { email: studentEmail },
          relations: ['enrolledCourses'], 
        });
    
        if (!student) {
          this.logger.warn(`Student not found with email: ${studentEmail}`);
          throw new Error('Student not found');
        }
    
        const gradeHistory = await this.gradeHistoryRepository.find({
          where: {
            studentCourseGrade: {
              studentCourse: {
                student: student,
              },
            },
          },
          relations: ['studentCourseGrade', 'studentCourseGrade.studentCourse'],
        });
        this.logger.log(`Successfully fetched grade history for student with email: ${studentEmail}`);
        return gradeHistory;
      }

    async getGradeHistoryByTeacher(teacherEmail: string) {
      this.logger.log(`Fetching grade history for teacher with email: ${teacherEmail}`);
      const teacher = await this.userService.findTeacherByEmail(teacherEmail);
    
        if (!teacher) {
          this.logger.warn(`Teacher not found with email: ${teacherEmail}`);
          throw new Error('Teacher not found');
        }
    
        const gradeHistory = await this.gradeHistoryRepository.find({
          where: {
            studentCourseGrade: {
              studentCourse: {
                course: {
                  teacher: teacher,
                },
              },
            },
          },
          relations: ['studentCourseGrade', 'studentCourseGrade.studentCourse'],
        });
    
        this.logger.log(`Successfully fetched grade history for teacher with email: ${teacherEmail}`);
        return gradeHistory;
    }
}
