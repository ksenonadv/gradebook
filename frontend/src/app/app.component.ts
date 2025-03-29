import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterModule } from '@angular/router';
import { Toast, ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, RouterModule, ToastModule, Toast],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
}
