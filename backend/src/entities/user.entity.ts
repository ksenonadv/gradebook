import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Course } from './course.entity';
import { StudentCourse } from './student-course.entity';

export const enum UserRole {
  Student,
  Teacher
};

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({ default: UserRole.Student })
  role: UserRole;
  
  @OneToMany(() => Course, (course) => course.teacher)
  courses: Course[];

  @OneToMany(() => StudentCourse, (studentCourse) => studentCourse.student)
  enrolledCourses: StudentCourse[];

  @Column({ nullable: true })
  image: string;
}
