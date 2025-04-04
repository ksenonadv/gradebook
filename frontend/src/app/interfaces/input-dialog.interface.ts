export interface InputDialogData {
	label: string;
	title: string;
	type: 'text' | 'number' | 'email' | 'confirm';
	value?: any;
	buttonSubmitText?: string;
	buttonCancelText?: string;
	min?: number;
	max?: number;
};