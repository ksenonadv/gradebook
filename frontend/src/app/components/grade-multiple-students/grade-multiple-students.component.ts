import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { NotificationsService } from '../../services/notifications.service';
import { CoursePageInfo } from '../../interfaces/course.interface';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as Papa from 'papaparse';

@Component({
  selector: 'app-grade-multiple-students',
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './grade-multiple-students.component.html',
  styleUrl: './grade-multiple-students.component.scss'
})
export class GradeMultipleStudentsComponent {
  id!: number;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly auth = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);

  public course: CoursePageInfo | undefined = undefined;
  public user: User | undefined = undefined;

  public students: {firstName: string, lastName: string, email: string, inputGrade: number | undefined}[]| undefined = undefined; 

  public csvErrors: string[] = [];
  public showCsvErrorsModal: boolean = false;

  ngOnInit() {

    this.route.params.subscribe((params) => {

      this.id = parseInt(params['id']);

      if (!this.id) {
        this.notificationsService.error("Error", "Something went wrong");
        this.router.navigate([
          '/courses'
        ]);
        return;
      }

      this.courseService.getCourse(this.id).then((course) => {
        this.course = course;
        this.user = this.auth.getUserData();
        
        if (this.course?.students) {
          this.students = this.course.students.map(student => ({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            inputGrade: undefined
          }));
        }
      });
    });
  }

  submitGrades() {
    const gradesArray = this.students
    ?.filter(student => student.inputGrade !== undefined && student.inputGrade !== null)
    .map(student => ({
      email: student.email,
      grade: student.inputGrade as number
    })) || [];
    
    if (gradesArray.length > 0){
      this.courseService.submitGradesForCourse(this.id, gradesArray).then(response => {
        this.notificationsService.success("Success", "The grades were successfully submitted.");
        this.router.navigate([
          '/course', this.course?.id
        ]);
      }).catch(error => {
        this.notificationsService.error("Error", error);
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    this.csvErrors = [];
    this.showCsvErrorsModal = false;

    if (file) {
      Papa.parse(file, {
        complete: (result) => {
          if (!result.meta.fields || !this.validateCSVHeaders(result.meta.fields)) {
            this.csvErrors = [`Invalid CSV headers. Expected headers: "email", "grade"`];
            this.showCsvErrorsModal = true;
            return;
          }
          this.processCSV(result.data);
        },
        header: true,
        error: (err) => {
          this.csvErrors.push(`General parsing error: ${err.message}`);
          this.showCsvErrorsModal = true;
        }
      });
    }

    event.target.value = '';
  }
  
  validateCSVHeaders(headers: string[]): boolean {
    const expectedHeaders = ['email', 'grade'];
    if (headers.length !== expectedHeaders.length) {
      return false;
    }
  
    return expectedHeaders.every((header, index) => headers[index].trim().toLowerCase() === header);
  }
  
  
  processCSV(data: any[]) {
    this.csvErrors = [];

    data.forEach((item: any, index: number) => {
      if (!item.email && !item.grade) return;
      
      if (!item.email || !item.grade) {
        this.csvErrors.push(`Row ${index + 1}: Missing email or grade`);
        return;
      }
  
      const student = this.students?.find(s => s.email === item.email);
  
      if (!student) {
        this.csvErrors.push(`Row ${index + 1}: No student with email ${item.email}`);
        return;
      }
  
      const grade = parseInt(item.grade, 10);
      if (isNaN(grade) || grade < 1 || grade > 10) {
        this.csvErrors.push(`Row ${index + 1}: Invalid grade for ${item.email} - must be between 1 and 10`);
        return;
      }
  
      student.inputGrade = grade;
    });
  
    if (this.csvErrors.length > 0) {
      this.showCsvErrorsModal = true;
    }
  }
  
  
}
