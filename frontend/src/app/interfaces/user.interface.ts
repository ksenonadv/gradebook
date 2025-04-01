export const enum UserRole {
  Student,
  Teacher
};

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  image: string;
}