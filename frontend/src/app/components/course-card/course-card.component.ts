import { Component, Input, EventEmitter, Output, inject} from '@angular/core';
import { CourseService } from '../../services/course.service';
import { UserRole } from '../../interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-course-card',
  imports: [
    CommonModule,
    MatButtonModule,
    FormsModule,
  ],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.scss'
})
export class CourseCardComponent {
  @Input() course: any;
  @Input() userRole: UserRole | undefined;

  @Output() courseDeleted = new EventEmitter<string>();
  @Output() studentEnrolled = new EventEmitter<string>();
  private readonly notificationsService = inject(NotificationsService);

  constructor(private courseService: CourseService, private dialog: MatDialog) {}

  deleteCourse(): void {
    if (this.userRole === UserRole.Teacher) {
      this.courseService.destroyCourse(this.course.title, this.course.teacher.email)
      .then((response: any) => {
        this.notificationsService.success(
          'Success',
          response.message
        );
      }).catch(error => {
        this.notificationsService.error(
          'Error',
          error
        );
      });
    }
  }

  enrollStudent(): void {
    if (this.userRole === UserRole.Teacher) {
      const studentEmail = prompt("Enter the student's email:");
      if (studentEmail) {
        this.courseService.enrollStudent(this.course.title, studentEmail, this.course.teacher.email)
        .then((response: any) => {
          this.notificationsService.success(
            'Success',
            response.message
          );
        }).catch(error => {
          this.notificationsService.error(
            'Error',
            error
          );
        });
      }
    }
  }
}