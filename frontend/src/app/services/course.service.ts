import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { CourseGrade, CoursePageInfo } from '../interfaces/course.interface';

/**
 * Service responsible for managing course-related operations in the frontend.
 * Handles communication with the backend for course creation, student enrollment,
 * grade management, and course information retrieval.
 */
@Injectable({
  providedIn: 'root',
})
export class CourseService {
  
  private apiUrl = `${environment.apiUrl}/course`;

  /**
   * Creates an instance of CourseService.
   * 
   * @param http - The Angular HttpClient for making API requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Creates a new course in the system.
   * 
   * @param title - The title of the course
   * @param description - The description of the course
   * @param teacherEmail - The email of the teacher creating the course
   * @returns A Promise resolving with the created course or rejecting with an error message
   */
  createCourse(title: string, description: string, teacherEmail: string): Promise<any> {
    const createCourseDto = { title, description, teacherEmail };
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/create`, createCourseDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while creating the course'),
      });
    });
  }

  /**
   * Deletes a course from the system.
   * 
   * @param title - The title of the course to delete
   * @param teacherEmail - The email of the teacher attempting to delete the course
   * @returns A Promise resolving with a success message or rejecting with an error message
   */
  destroyCourse(title: string, teacherEmail: string): Promise<any> {
    const destroyCourseDto = { title, teacherEmail };
    return new Promise<any>((resolve, reject) => {
      this.http.delete<any>(`${this.apiUrl}/delete`, { body: destroyCourseDto }).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while deleting the course'),
      });
    });
  }

  /**
   * Enrolls a student in a course.
   * 
   * @param courseTitle - The title of the course
   * @param studentEmail - The email of the student to enroll
   * @param teacherEmail - The email of the teacher authorizing the enrollment
   * @returns A Promise resolving with a success message or rejecting with an error message
   */
  enrollStudent(courseTitle: string, studentEmail: string, teacherEmail: string): Promise<any> {
    const enrollStudentDto = { courseTitle, studentEmail, teacherEmail };
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/enroll`, enrollStudentDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while enrolling the student'),
      });
    });
  }

  /**
   * Retrieves all courses taught by a specific teacher.
   * 
   * @param teacherEmail - The email of the teacher
   * @returns A Promise resolving with an array of course information objects or rejecting with an error message
   */
  findCoursesByTeacher(teacherEmail: string): Promise<any> {
    const findCoursesByTeacherDto = { teacherEmail };
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/findByTeacher`, findCoursesByTeacherDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while fetching courses for the teacher'),
      });
    });
  }

  /**
   * Retrieves all courses in which a specific student is enrolled.
   * 
   * @param studentEmail - The email of the student
   * @returns A Promise resolving with an array of course information objects or rejecting with an error message
   */
  findCoursesByStudent(studentEmail: string): Promise<any> {
    const findCoursesByStudentDto = { studentEmail };
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/findByStudent`, findCoursesByStudentDto).subscribe({
        next: (response) =>{resolve(response)},
        error: (error) => reject(error.error?.message || 'An error occurred while fetching courses for the student'),
      });
    });
  }

  /**
   * Retrieves the list of students enrolled in a specific course.
   * 
   * @param courseTitle - The title of the course
   * @returns A Promise resolving with an array of student information objects or rejecting with an error message
   */
  getStudentsForCourse(courseTitle: string): Promise<any> {
    const getStudentsForCourseDto = { courseTitle };
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/getStudentsForCourse`, getStudentsForCourseDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while fetching students for the course'),
      });
    });
  }

  /**
   * Retrieves detailed information about a specific course.
   * 
   * @param id - The ID of the course to retrieve
   * @returns A Promise resolving with course details or rejecting with an error message
   */
  getCourse(id: number) {
    return new Promise<CoursePageInfo>((resolve, reject) => {
      this.http.post<CoursePageInfo>(`${this.apiUrl}/getCourse`, { id }).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while fetching the course'),
      });
    });
  }

  /**
   * Adds a grade for a specific student in a course.
   * 
   * @param courseId - The ID of the course
   * @param studentEmail - The email of the student receiving the grade
   * @param grade - The numeric grade value
   * @returns A Promise resolving with the created grade object or rejecting with an error message
   */
  addStudentGrade(courseId: number, studentEmail: string, grade: number): Promise<CourseGrade> {
    const addStudentGradeDto = { courseId, studentEmail, grade };
    return new Promise<CourseGrade>((resolve, reject) => {
      this.http.post<CourseGrade>(`${this.apiUrl}/addStudentGrade`, addStudentGradeDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while adding the student grade'),
      });
    });
  }

  /**
   * Edits an existing grade for a student.
   * 
   * @param id - The ID of the grade to edit
   * @param grade - The new grade value
   * @returns A Promise resolving with a boolean success indicator or rejecting with an error message
   */
  editStudentGrade(id: number, grade: number): Promise<boolean> {
    const editStudentGradeDto = { id, grade };
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<boolean>(`${this.apiUrl}/editStudentGrade`, editStudentGradeDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while editing the student grade'),
      });
    });
  }

  /**
   * Deletes a grade for a student.
   * 
   * @param id - The ID of the grade to delete
   * @returns A Promise resolving with a boolean success indicator or rejecting with an error message
   */
  deleteStudentGrade(id: number): Promise<boolean> {
    const deleteStudentGradeDto = { id };
    return new Promise<boolean>((resolve, reject) => {
      this.http.post<boolean>(`${this.apiUrl}/deleteStudentGrade`, deleteStudentGradeDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => reject(error.error?.message || 'An error occurred while deleting the student grade'),
      });
    });
  }

  /**
   * Submits multiple grades for students in a course at once.
   * 
   * @param courseId - The ID of the course
   * @param gradesArray - Array of objects containing student emails and their grades
   * @returns A Promise resolving with a success message or rejecting with an error message
   */
  submitGradesForCourse(courseId: number, gradesArray: Array<{ email: string, grade: number}>): Promise<any> {
  
    const submitGradesDto = { courseId, grades: gradesArray };
  
    return new Promise<any>((resolve, reject) => {
      this.http.post<any>(`${this.apiUrl}/submitGrades`, submitGradesDto).subscribe({
        next: (response) => resolve(response),
        error: (error) => {
          if (error.error?.message) {
            const messageValues: string[] = Object.values(error.error.message);
  
            const gradeError = messageValues.find((message: string) =>
              message.includes('Grade cannot exceed')
            );
  
            if (gradeError) {
              reject(`One or more grades are invalid`);
              return;
            }
          }
          
          reject(error.error?.message || 'An error occurred while submitting grades');
        }});
    });
  }
}
