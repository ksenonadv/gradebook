import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Action, GradeHistory } from '../entities/grade-history.entity';
import { StudentCourseGrade } from '../entities/grade.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';

/**
 * Service responsible for tracking and retrieving the history of grade changes.
 * Maintains an audit trail of all grade-related actions for academic integrity.
 */
@Injectable()
export class GradeHistoryService {    
    private readonly logger = new Logger(GradeHistoryService.name);

    /**
     * Creates an instance of GradeHistoryService.
     * 
     * @param gradeHistoryRepository - Repository for GradeHistory entities
     * @param userService - Service for user-related operations
     */
    constructor(
        @InjectRepository(GradeHistory) private readonly gradeHistoryRepository: Repository<GradeHistory>,
        private userService: UserService
      ) {}

    /**
     * Records the creation of a new grade in the history.
     * 
     * @param grade - The grade entity that was created
     * @param action - The action performed (Create)
     * @param newValue - The value of the new grade
     */
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

    /**
     * Records the modification of an existing grade in the history.
     * 
     * @param grade - The grade entity that was modified
     * @param action - The action performed (Update)
     * @param oldValue - The previous value of the grade
     * @param newValue - The new value of the grade
     */
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

    /**
     * Records the deletion of a grade in the history.
     * 
     * @param grade - The grade entity that was deleted
     * @param action - The action performed (Delete)
     * @param oldValue - The value of the grade that was deleted
     */
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

    /**
     * Retrieves the complete grade history for a specific student.
     * 
     * @param studentEmail - The email of the student
     * @returns An array of grade history entries for the student
     * @throws Error if the student is not found
     */
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

    /**
     * Retrieves the complete grade history for all students taught by a specific teacher.
     * 
     * @param teacherEmail - The email of the teacher
     * @returns An array of grade history entries for all students taught by the teacher
     * @throws Error if the teacher is not found
     */
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
