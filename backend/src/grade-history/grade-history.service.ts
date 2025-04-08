import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Action, GradeHistory } from '../entities/grade-history.entity';
import { StudentCourseGrade } from '../entities/grade.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

@Injectable()
export class GradeHistoryService {
    constructor(
        @InjectRepository(GradeHistory) private readonly gradeHistoryRepository: Repository<GradeHistory>,
        private userService: UserService
      ) {}

    async addGradeHistory(grade: StudentCourseGrade, action: Action, newValue: number){
        const gradeHistory = this.gradeHistoryRepository.create({
            studentCourseGrade: grade,
            action,
            newValue,
            date: new Date(),
        });
        await this.gradeHistoryRepository.save(gradeHistory);
    }

    async editGradeHistory(grade: StudentCourseGrade, action: Action, oldValue: number, newValue: number){
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
        const gradeHistory = this.gradeHistoryRepository.create({
            studentCourseGrade: grade,
            action,
            oldValue,
            date: new Date(),
        });
        await this.gradeHistoryRepository.save(gradeHistory);
    }

    async getGradeHistoryByStudent(studentEmail: string) {
        const student = await this.userService.findStudentWithRelations({
          where: { email: studentEmail },
          relations: ['enrolledCourses'], 
        });
    
        if (!student) {
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
    
        return gradeHistory;
      }

    async getGradeHistoryByTeacher(teacherEmail: string) {
        const teacher = await this.userService.findTeacherByEmail(teacherEmail);
    
        if (!teacher) {
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
    
        return gradeHistory;
    }
}
