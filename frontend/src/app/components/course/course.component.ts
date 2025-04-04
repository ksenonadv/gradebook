import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { CommonModule } from '@angular/common';
import { CoursePageInfo } from '../../interfaces/course.interface';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss',
  standalone: true,
  imports: [
    CommonModule
  ],
})
export class CourseComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private auth = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);

  public course: CoursePageInfo | undefined = undefined;
  public user: User | undefined = undefined;

  ngOnInit() {

    this.route.params.subscribe((params) => {

      const id = parseInt(params['id']);

      if (!id) {
        this.router.navigate([
          '/courses'
        ]);
        return;
      }

      this.courseService.getCourse(id).then((course) => {
        this.course = course;
        this.user = this.auth.getUserData();
      });

    });
  }

  public get isTeacher(): boolean {
    return this.course?.teacher.email === this.user?.email;
  }

  public enrollStudent(): void {
    if (this.isTeacher) {
      const studentEmail = prompt("Enter the student's email:");
      if (studentEmail) {
        this.courseService.enrollStudent(this.course!.title, studentEmail, this.course!.teacher.email)
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
