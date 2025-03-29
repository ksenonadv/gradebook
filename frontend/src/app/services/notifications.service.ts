import { inject, Injectable } from "@angular/core";
import { MessageService } from "primeng/api";

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {

  private readonly messageService = inject(MessageService);

  public success(title: string, message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000,
    });
  }

  public error(title: string, message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 3000,
    });
  }

  public info(title: string, message: string): void {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000,
    });
  }
}