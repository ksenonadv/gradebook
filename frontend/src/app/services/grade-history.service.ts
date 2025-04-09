import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GradeHistoryService {
  private apiUrl = `${environment.apiUrl}/history`;

  constructor(private http: HttpClient) {}

  getGradeHistoryByStudent(emailStudent: string): Observable<any> {
    const params = new HttpParams().set('emailStudent', emailStudent);
    console.log(params);
    console.log(`${this.apiUrl}/getGradeHistoryByStudent`);
    console.log(emailStudent);
    return this.http.get(`${this.apiUrl}/getGradeHistoryByStudent`, { params });
  }

  getGradeHistoryByTeacher(emailTeacher: string): Observable<any> {
    const params = new HttpParams().set('emailTeacher', emailTeacher);
    return this.http.get(`${this.apiUrl}/getGradeHistoryByTeacher`, { params });
  }
}
