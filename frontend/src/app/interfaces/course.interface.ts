import { User } from "./user.interface";

export interface Course {
  title: string;
  description: string;
  teacher: User;
}

export interface CourseGrade {
  id: number;
  date: Date;
  grade: number;
};

export type CourseStudent = User & { grades: Array<CourseGrade>; };

export interface CoursePageInfo {
  id: number;
  title: string;
  description: string;
  teacher: User;
  students?: Array<CourseStudent>;
  grades?: Array<CourseGrade>;
}