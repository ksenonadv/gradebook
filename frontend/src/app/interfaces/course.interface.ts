import { User } from "./user.interface";

export interface Course {
  title: string;
  description: string;
  teacher: User;
}

export interface CoursePageInfo {
  id: number;
  title: string;
  description: string;
  teacher: User;
  students?: Array<User>;
  grades?: Array<any>;
}