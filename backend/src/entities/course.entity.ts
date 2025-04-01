import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { StudentCourse } from './student-course.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.courses, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacherId' })
  teacher: User;

  @OneToMany(() => StudentCourse, (studentCourse) => studentCourse.course)
  students: StudentCourse[];
}
