import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { StudentCourse } from './student-course.entity';

@Entity('student_course_grade')
export class StudentCourseGrade {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudentCourse, (studentCourse) => studentCourse.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentCourseId' })
  studentCourse: StudentCourse;

  @Column()
  date: Date;

  @Column()
  grade: number;
}
