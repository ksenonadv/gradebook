import { Component, inject } from '@angular/core';
import { CoursePageInfo } from '../../interfaces/course.interface';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { Router } from '@angular/router';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-courses-grades',
  imports: [
    CommonModule,
  ],
  templateUrl: './courses-grades.component.html',
  styleUrl: './courses-grades.component.scss'
})
export class CoursesGradesComponent {

  private readonly courseService = inject(CourseService);
  private readonly router = inject(Router);
    private readonly auth = inject(AuthService);
  
  public courses: CoursePageInfo[] | undefined = undefined;
  public user: User | undefined = undefined;
  
  ngOnInit() {
    this.user = this.auth.getUserData();
    this.courseService.findCoursesByStudent(this.user?.email as string).then((courses) => {
      this.courses = courses;
      console.log(courses);
    }).catch(() => {
      this.router.navigate([
        '/courses'
      ]);
    });
  }
  
}
