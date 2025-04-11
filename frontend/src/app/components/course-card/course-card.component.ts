import { Component, Input, EventEmitter, Output, inject} from '@angular/core';
import { CourseService } from '../../services/course.service';
import { UserRole } from '../../interfaces/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';
import { Router } from '@angular/router';

/**
 * Component for displaying an individual course in a card format.
 * Used in the courses list to present each course with its basic information
 * and relevant actions based on user role.
 */
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
  
  /** Course data to display in the card */
  @Input() course: any;
  
  /** Flag indicating if the current user is a teacher, used to show/hide teacher actions */
  @Input() isTeacher: boolean = false;

  private readonly notificationsService = inject(NotificationsService);
  
  /**
   * Creates an instance of CourseCardComponent.
   * 
   * @param courseService - Service for course-related operations
   * @param dialog - Angular Material dialog service
   * @param router - Angular router for navigation
   */
  constructor(private courseService: CourseService, private dialog: MatDialog, private router: Router) {}

  /**
   * Handles the course deletion action.
   * Only available for teachers who own the course.
   * Shows success notification and refreshes the page upon successful deletion.
   */
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

  /**
   * Refreshes the current page to show updated course data.
   * Uses a navigation trick to force Angular to reload the component.
   */
  refreshPage() {
    this.router.navigateByUrl('/').then(() => {
      this.router.navigate(['/courses']);
    });
  }

  /**
   * Navigates to the detailed view of the course.
   * Triggered when the user clicks on the course card.
   */
  goToCourseDetails() {
    this.router.navigate(['/course', this.course.id]);
  }
}