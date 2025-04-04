import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { InputDialogData } from '../interfaces/input-dialog.interface';
import { InputDialogComponent } from '../components/input-dialog/input-dialog.component';

@Injectable({
	providedIn: 'root'
})
export class InputDialogService {
	
  private readonly dialog = inject(MatDialog);

	public open(data: InputDialogData) {
		
    const dialog = this.dialog.open(InputDialogComponent, {
			minWidth: '400px',
			data
		});

		return firstValueFrom<string>(dialog.afterClosed());
	}

	public confirm(title: string, message: string): Promise<boolean> {
		return this.open({
			title,
			label: message,
			type: 'confirm',
			buttonSubmitText: 'Yes',
			buttonCancelText: 'No'
		}) as unknown as Promise<boolean>;
	}

}
