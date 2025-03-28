import { Component } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [NavbarComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
