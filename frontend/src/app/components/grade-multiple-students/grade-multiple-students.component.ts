import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { NotificationsService } from '../../services/notifications.service';
import { CoursePageInfo } from '../../interfaces/course.interface';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  public notificationMessage: string | null = null;

  public students: {firstName: string, lastName: string, email: string, inputGrade: number | undefined}[]| undefined = undefined; 

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
          `/courses/${this.course?.id}`
        ]);
      }).catch(error => {
        this.notificationsService.error("Error", error);
      });
    }
  }
}
