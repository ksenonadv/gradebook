import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { CommonModule } from '@angular/common';
import { CourseGrade, CoursePageInfo, CourseStudent } from '../../interfaces/course.interface';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { User, UserRole } from '../../interfaces/user.interface';
import { InputDialogService } from '../../services/input-dialog.service';

/**
 * Component responsible for displaying and managing a single course.
 * Handles course details, student enrollment, grade management, and student performance tracking.
 * Different functionality is available based on whether the logged-in user is a teacher or student.
 */
@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrl: './course.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
})
export class CourseComponent {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly courseService = inject(CourseService);
  private readonly auth = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);
  private readonly inputDialogService = inject(InputDialogService);

  /** The current course information */
  public course: CoursePageInfo | undefined = undefined;
  
  /** The currently logged-in user */
  public user: User | undefined = undefined;
  
  /** The current average grade for a student in this course */
  public currentAverage: number | undefined = undefined;

  /**
   * Initializes the component by loading course data.
   * Retrieves course details based on the route parameter.
   * Calculates current average grade for students.
   */
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
        if(this.user?.role === UserRole.Student){
          if (this.course?.grades) {
            const totalAverage = this.course.grades.reduce((acc: number, course: CourseGrade) => {
              const grade = course.grade;
              return acc + grade;
            }, 0) / this.course.grades.length;
            this.currentAverage = parseFloat(totalAverage.toFixed(2));
          }
         }
      }).catch(() => {
        this.router.navigate([
          '/courses'
        ]);
      });
    });
  }

  /**
   * Determines if the current user is the teacher of the course.
   * Used to conditionally display teacher-specific functionality.
   * 
   * @returns True if the current user is the teacher of the course, false otherwise
   */
  public get isTeacher(): boolean {
    return this.course?.teacher.email === this.user?.email;
  }

  /**
   * Displays a dialog to enroll a new student in the course.
   * Processes the enrollment through the CourseService.
   */
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

  /**
   * Displays a dialog to add a grade for a student.
   * Updates the UI with the new grade upon successful addition.
   * 
   * @param student - The student to add a grade for
   */
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

  /**
   * Displays a dialog to edit an existing grade.
   * Updates the UI with the modified grade upon successful edit.
   * 
   * @param student - The student whose grade is being edited
   * @param grade - The grade object to edit
   */
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

  /**
   * Displays a confirmation dialog to delete a grade.
   * Updates the UI by removing the grade upon successful deletion.
   * 
   * @param student - The student whose grade is being deleted
   * @param grade - The grade object to delete
   */
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

  /**
   * Calculates the average grade for a student from their grade history.
   * 
   * @param grades - Array of grade objects for the student
   * @returns The calculated average grade, rounded to 2 decimal places
   */
  public getStudentAverage(grades: { grade: number }[]): number {
    if (grades.length === 0) {
      return 0; 
    }
    const total = grades.reduce((acc: number, grade: { grade: number }) => acc + grade.grade, 0);
    return parseFloat((total / grades.length).toFixed(2)); 
  }
}
