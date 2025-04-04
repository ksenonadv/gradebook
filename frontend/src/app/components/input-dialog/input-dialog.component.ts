import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, Inject } from '@angular/core';
import { InputDialogData } from '../../interfaces/input-dialog.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-input-dialog',
	templateUrl: './input-dialog.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ]
})
export class InputDialogComponent {
	
  public constructor(
		private readonly dialogRef: MatDialogRef<InputDialogComponent>,
		@Inject(MAT_DIALOG_DATA)
		public readonly data: InputDialogData
	) { }

	public close() {
		this.dialogRef.close(
      null
    );
	}

	public submit() {

		if (this.data.type === 'confirm')
			this.data.value = true;

		this.dialogRef.close(this.data.value);
	}
}
