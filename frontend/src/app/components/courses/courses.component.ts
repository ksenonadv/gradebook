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
import { ChangeDetectorRef } from '@angular/core';

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
  public user: User | undefined = undefined;

  private readonly courseService = inject(CourseService); 
  courses: any[] = [];
  loading = false;

  private destroyRef: DestroyRef = inject(DestroyRef);
  private readonly notificationsService = inject(NotificationsService);
  
  constructor(
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

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
        this.cdr.detectChanges();
      }).catch(error => {
        this.notificationsService.error(
          'Error',
          error
        );
      });
    }
  }
  
}
