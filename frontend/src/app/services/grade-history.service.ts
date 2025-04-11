import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

/**
 * Service responsible for retrieving grade history information from the server.
 * Provides methods to access the audit trail of grade changes for students and teachers.
 */
@Injectable({
  providedIn: 'root',
})
export class GradeHistoryService {
  private apiUrl = `${environment.apiUrl}/history`;

  /**
   * Creates an instance of GradeHistoryService.
   * 
   * @param http - The Angular HttpClient for making API requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Retrieves the complete grade history for a specific student.
   * 
   * @param emailStudent - The email address of the student
   * @returns An Observable with the grade history entries for the student
   */
  getGradeHistoryByStudent(emailStudent: string): Observable<any> {
    const params = new HttpParams().set('emailStudent', emailStudent);
    return this.http.get(`${this.apiUrl}/getGradeHistoryByStudent`, { params });
  }

  /**
   * Retrieves the complete grade history for all students taught by a specific teacher.
   * 
   * @param emailTeacher - The email address of the teacher
   * @returns An Observable with the grade history entries for all students taught by the teacher
   */
  getGradeHistoryByTeacher(emailTeacher: string): Observable<any> {
    const params = new HttpParams().set('emailTeacher', emailTeacher);
    return this.http.get(`${this.apiUrl}/getGradeHistoryByTeacher`, { params });
  }
}
