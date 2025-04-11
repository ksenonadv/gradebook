import { Component, Inject, OnInit, inject } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { User, UserRole } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { CreateCourseDialogComponent } from '../create-course-dialog/create-course-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CourseCardComponent } from '../course-card/course-card.component';
import { CommonModule } from '@angular/common';
import { NotificationsService } from '../../services/notifications.service';
import { Router } from '@angular/router';

/**
 * Component responsible for displaying and managing a list of courses.
 * Shows different courses and provides different functionality based on whether the user is a teacher or student.
 * Teachers can create new courses and see courses they teach.
 * Students can see courses they are enrolled in.
 */
@Component({
  selector: 'app-courses',
  imports: [
    CommonModule,
    CourseCardComponent,
    MatDialogModule,
    MatButtonModule,
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  private readonly authService = inject(AuthService); 
  
  /** Current authenticated user */
  public user: User | undefined = undefined;

  private readonly courseService = inject(CourseService); 
  
  /** List of courses to display */
  courses: any[] = [];
  
  /** Loading state indicator */
  loading = false;

  private destroyRef: DestroyRef = inject(DestroyRef);
  private readonly notificationsService = inject(NotificationsService);

  /**
   * Creates an instance of CoursesComponent.
   * 
   * @param dialog - Angular Material dialog service for creating course dialog
   * @param router - Angular router for navigation
   */
  constructor(
    private dialog: MatDialog,
    private router: Router
  ) {}

  /**
   * Initializes the component and subscribes to user data changes.
   * Loads appropriate courses based on the user's role (teacher or student).
   */
  ngOnInit(): void {
    this.authService.userData$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((user: User | undefined) => {
      this.user = user;
      if (this.user) {
        if (this.user.role === UserRole.Teacher) {
          this.loadCoursesByTeacher();
        } else if (this.user.role === UserRole.Student) {
          this.loadCoursesByStudent();
        }
      }
    });
  }

  /**
   * Loads courses taught by the current teacher.
   * Sets loading state and handles errors.
   */
  loadCoursesByTeacher(): void {
    this.loading = true;
    this.courseService.findCoursesByTeacher(this.user?.email || '')
    .then((response: any) => {
      this.courses = response;
      this.loading = false;
    }).catch(error => {
      this.notificationsService.error(
        'Error',
        error
      );
    });
  }

  /**
   * Loads courses in which the current student is enrolled.
   * Sets loading state and handles errors.
   */
  loadCoursesByStudent(): void {
    this.loading = true;
    this.courseService.findCoursesByStudent(this.user?.email || '')
    .then((response: any) => {
      this.courses = response;
      this.loading = false;
    }).catch(error => {
      this.notificationsService.error(
        'Error',
        error
      );
    });
  }  

  /**
   * Opens a dialog for creating a new course.
   * Available only for teachers.
   */
  openCreateCourseDialog(): void {
    const dialogRef = this.dialog.open(CreateCourseDialogComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe((result: { title: string, description: string } | undefined) => {
      if (result) {
        this.createCourse(result.title, result.description);
      }
    });
  }

  /**
   * Creates a new course with the provided title and description.
   * Available only for teachers.
   * 
   * @param title - The title of the new course
   * @param description - The description of the new course
   */
  createCourse(title: string, description: string): void {
    if (!title || !description) {
      console.log('Invalid course data');
      return;
    }
    
    if (this.user?.role === UserRole.Teacher) {
      this.courseService.createCourse(title, description, this.user.email)
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
}
