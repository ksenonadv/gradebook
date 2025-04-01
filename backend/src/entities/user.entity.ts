import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

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

  @Column({ nullable: true })
  image: string;
}
