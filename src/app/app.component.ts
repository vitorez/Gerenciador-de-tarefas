import { Component } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DashboardComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.scss',
})
export class AppComponent {}
