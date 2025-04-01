import { User } from "./user.interface";

export interface Course {
    title: string;
    description: string;
    teacher: User;
}