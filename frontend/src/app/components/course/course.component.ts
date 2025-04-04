import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { CommonModule } from '@angular/common';
import { CourseGrade, CoursePageInfo, CourseStudent } from '../../interfaces/course.interface';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { User } from '../../interfaces/user.interface';
import { InputDialogService } from '../../services/input-dialog.service';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class CourseComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly auth = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly inputDialogService = inject(InputDialogService);

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

  public async enrollStudent() {
    
   const result = await this.inputDialogService.open({
      title: 'Enroll Student',
      label: `Enter the student's email:`,
      type: 'text',
      value: '',
      buttonSubmitText: 'Enroll',
    });

    if (!result)
      return;

    this.courseService.enrollStudent(this.course!.title, result, this.course!.teacher.email).then((response: any) => {
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

  public async addStudentGrade(student: CourseStudent) {

    const result = await this.inputDialogService.open({
      title: 'Add Student Grade',
      label: `Enter the grade:`,
      type: 'number',
      value: 1,
      min: 1,
      max: 10,
      buttonSubmitText: 'Grade Student',
    });

    if (!result)
      return;

    this.courseService.addStudentGrade(this.course!.id, student.email, parseInt(result)).then((response: CourseGrade) => {

      student.grades.push(
        response
      );

      this.notificationsService.success(
        'Success',
        'Grade added successfully'
      );
    }).catch(error => {
      this.notificationsService.error(
        'Error',
        error
      );
    });
  }

  public async editStudentGrade(student: CourseStudent, grade: CourseGrade) {

    const result = await this.inputDialogService.open({
      title: `Edit ${student.firstName} ${student.lastName}'s Grade`,
      label: `Enter the new grade:`,
      type: 'number',
      value: grade.grade,
      min: 1,
      max: 10,
      buttonSubmitText: 'Edit Grade',
    });

    if (!result)
      return;

    const editGrade = parseInt(result);

    this.courseService.editStudentGrade(grade.id, editGrade).then(() => {

      grade.grade = editGrade;

      this.notificationsService.success(
        'Success',
        'Grade edited successfully'
      );

    }).catch(error => {
      this.notificationsService.error(
        'Error',
        error
      );
    });
  }

  public async deleteStudentGrade(student: CourseStudent, grade: CourseGrade) {

    const confirmed = await this.inputDialogService.confirm(
      'Delete Student Grade',
      `Are you sure you want to delete ${student.firstName} ${student.lastName}'s grade?`
    );

    if (!confirmed)
      return;

    this.courseService.deleteStudentGrade(grade.id).then(() => {

      student.grades = student.grades.filter((g) => g.id !== grade.id);

      this.notificationsService.success(
        'Success',
        'Grade deleted successfully'
      );

    }).catch(error => {
      this.notificationsService.error(
        'Error',
        error
      );
    });

  }

}
