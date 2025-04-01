import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-course-dialog',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './create-course-dialog.component.html',
  styleUrls: ['./create-course-dialog.component.scss']
})
export class CreateCourseDialogComponent {
  title: string = '';
  description: string = '';

  constructor(public dialogRef: MatDialogRef<CreateCourseDialogComponent>) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onCreate(): void {
    if (this.title && this.description) {
      this.dialogRef.close({ title: this.title, description: this.description });
    }
  }

  isFormValid(): boolean {
    return this.title.trim().length > 0 && this.description.trim().length > 0;
  }
}
