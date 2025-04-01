import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  
  private apiUrl = `${environment.apiUrl}/course`;

  constructor(private http: HttpClient) {}

  createCourse(title: string, description: string, teacherEmail: string): Promise<any> {
    const createCourseDto = { title, description, teacherEmail };
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/create`, createCourseDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while creating the course'),
      });
    });
  }

  destroyCourse(title: string, teacherEmail: string): Promise<any> {
    const destroyCourseDto = { title, teacherEmail };
    return new Promise<any>((resolve, reject) => {
      this.http.delete<any>(`${this.apiUrl}/delete`, { body: destroyCourseDto }).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while deleting the course'),
      });
    });
  }

  enrollStudent(courseTitle: string, studentEmail: string, teacherEmail: string): Promise<any> {
    const enrollStudentDto = { courseTitle, studentEmail, teacherEmail };
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/enroll`, enrollStudentDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while enrolling the student'),
      });
    });
  }

  findCoursesByTeacher(teacherEmail: string): Promise<any> {
    const findCoursesByTeacherDto = { teacherEmail };
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/findByTeacher`, findCoursesByTeacherDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while fetching courses for the teacher'),
      });
    });
  }

  findCoursesByStudent(studentEmail: string): Promise<any> {
    const findCoursesByStudentDto = { studentEmail };
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/findByStudent`, findCoursesByStudentDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while fetching courses for the student'),
      });
    });
  }

  getStudentsForCourse(courseTitle: string): Promise<any> {
    const getStudentsForCourseDto = { courseTitle };
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/getStudentsForCourse`, getStudentsForCourseDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while fetching students for the course'),
      });
    });
  }
}
