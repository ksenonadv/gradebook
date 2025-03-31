import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: UserRole.Student })
  role: UserRole;

  @Column()
  image: string;
}
