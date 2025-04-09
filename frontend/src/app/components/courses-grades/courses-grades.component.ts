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
  public currentAverage: number | undefined = undefined;
  
  ngOnInit() {
    this.user = this.auth.getUserData();
    this.courseService.findCoursesByStudent(this.user?.email as string).then((courses) => {
      this.courses = courses;
      this.currentAverage = parseFloat((courses.reduce((acc: number, course: CoursePageInfo) => {
        const grades = course.grades?.map((grade: { grade: number }) => grade.grade) || [];
        const average = grades.reduce((sum: number, grade: number) => sum + grade, 0) / grades.length;
        return acc + average;
      }, 0) / courses.length).toFixed(2));
    }).catch(() => {
      this.router.navigate([
        '/courses'
      ]);
    });
  }
  
}
