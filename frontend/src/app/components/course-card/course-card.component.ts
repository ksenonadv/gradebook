import { Component, Input, EventEmitter, Output, inject} from '@angular/core';
import { CourseService } from '../../services/course.service';
import { UserRole } from '../../interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';
import { Router } from '@angular/router';

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
  @Input() isTeacher: boolean = false;

  private readonly notificationsService = inject(NotificationsService);
  
  constructor(private courseService: CourseService, private dialog: MatDialog, private router: Router) {}

  deleteCourse(): void {
    if (this.isTeacher) {
      this.courseService.destroyCourse(this.course.title, this.course.teacher.email)
      .then((response: any) => {
        this.notificationsService.success(
          'Success',
          response.message
        );
        this.refreshPage();
      }).catch(error => {
        this.notificationsService.error(
          'Error',
          error
        );
      });
    }
  }

  refreshPage() {
    this.router.navigateByUrl('/').then(() => {
      this.router.navigate(['/courses']);
    });
  }

  goToCourseDetails() {
    this.router.navigate(['/course', this.course.id]);
  }

}