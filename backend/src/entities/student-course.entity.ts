import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Course } from './course.entity';
import { StudentCourseGrade } from './grade.entity';

@Entity('student_course')
export class StudentCourse 
{
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.enrolledCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentId' })
  student: User;

  @ManyToOne(() => Course, (course) => course.students, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany(() => StudentCourseGrade, (studentCourseGrade) => studentCourseGrade.studentCourse, { cascade: true })
  grades: StudentCourseGrade[];
}
