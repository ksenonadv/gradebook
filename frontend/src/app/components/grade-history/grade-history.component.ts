import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GradeHistoryService } from '../../services/grade-history.service';
import { AuthService } from '../../services/auth.service';
import { UserRole } from '../../interfaces/user.interface';
import { CommonModule } from '@angular/common';
import { Action } from '../../interfaces/grade-history.interface';

@Component({
  selector: 'app-grade-history',
  templateUrl: './grade-history.component.html',
  styleUrls: ['./grade-history.component.scss'],
  imports: [
    CommonModule,
  ],
})
export class GradeHistoryComponent implements OnInit {
  user: any;  
  gradeHistory: any;

  constructor(
    private auth: AuthService,
    private gradeHistoryService: GradeHistoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.auth.getUserData();

    if (this.user?.role === UserRole.Student) {
      this.gradeHistoryService
        .getGradeHistoryByStudent(this.user?.email as string)
        .subscribe(
          (gradeHistory) => {
            this.gradeHistory = gradeHistory.sort((a:any, b:any) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
          },
          (error) => {
            console.error(error);
            this.router.navigate(['/courses']);
          }
        );
    } else if (this.user?.role === UserRole.Teacher) {
      this.gradeHistoryService
        .getGradeHistoryByTeacher(this.user?.email as string)
        .subscribe(
          (gradeHistory) => {
            this.gradeHistory = gradeHistory.sort((a:any, b:any) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });
          },
          (error) => {
            console.error(error);
            this.router.navigate(['/courses']);
          }
        );
    }
  }

  getActionLabel(action: Action): string {
    switch (action) {
      case Action.Update:
        return 'Update';
      case Action.Delete:
        return 'Delete';
      case Action.Create:
        return 'Add';
      default:
        return '';
    }
  }
}