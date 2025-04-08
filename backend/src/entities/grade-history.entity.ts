import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { StudentCourseGrade } from "./grade.entity";

export const enum Action {
    Create,
    Update,
    Delete,
};

@Entity('grade_history')
export class GradeHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => StudentCourseGrade, (grade) => grade.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gradeId' })
  studentCourseGrade: StudentCourseGrade;

  @Column()
  action: Action;

  @Column({ nullable: true })
  oldValue: number;

  @Column({ nullable: true })
  newValue: number;

  @Column()
  date: Date;
}