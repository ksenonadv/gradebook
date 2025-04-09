import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany } from 'typeorm';
import { StudentCourse } from './student-course.entity';
import { GradeHistory } from './grade-history.entity';

@Entity('student_course_grade')
export class StudentCourseGrade {
  
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudentCourse, (studentCourse) => studentCourse.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentCourseId' })
  studentCourse: StudentCourse;

  @OneToMany(() => GradeHistory, (history) => history.studentCourseGrade)
  history: GradeHistory[];

  @Column()
  date: Date;

  @Column()
  grade: number;

  @Column({ default: false })
  isDeleted: boolean;
}
