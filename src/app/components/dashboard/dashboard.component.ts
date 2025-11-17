import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  get pendingTasks() {
    return this.tasks.filter((task) => task.status === 'pending');
  }

  get completedTasks() {
    return this.tasks.filter((task) => task.status === 'completed');
  }

  // Propriedade de tarefas
  tasks = [
    {
      title: 'Meditate for 10 minutes',
      time: 'Today, 8 PM',
      status: 'pending',
      tagColor: 'border-success',
      colorClass: 'bg-success',
    },
    {
      title: 'Run in the park',
      time: 'Today, 9 PM',
      status: 'pending',
      tagColor: 'border-success',
      colorClass: 'bg-success',
    },
    {
      title: 'Read a book',
      time: 'Today, 10 PM',
      status: 'pending',
      tagColor: 'border-success',
      colorClass: 'bg-success',
    },
    {
      title: 'Pay the rent',
      time: 'Today, 12 AM',
      status: 'completed',
      tagColor: 'border-danger',
      colorClass: 'bg-danger',
    },
    {
      title: 'Water the plants',
      time: 'Today, 2 PM',
      status: 'completed',
      tagColor: 'border-warning',
      colorClass: 'bg-warning',
    },
  ];

  tasks30Days = [
    { title: 'Meditate for 10 minutes', time: 'Today, 8 PM', colorClass: 'bg-success' },
    { title: 'Meditate for 10 minutes', time: 'Today, 8 PM', colorClass: 'bg-success' },
    { title: 'Meditate for 10 minutes', time: 'Today, 8 PM', colorClass: 'bg-success' },
    { title: 'Meditate for 10 minutes', time: 'Today, 8 PM', colorClass: 'bg-success' },
    { title: 'Meditate for 10 minutes', time: 'Today, 8 PM', colorClass: 'bg-success' },
    { title: 'Meditate for 10 minutes', time: 'Today, 8 PM', colorClass: 'bg-success' },
    { title: 'Meditate for 10 minutes', time: 'Today, 8 PM', colorClass: 'bg-success' },
    { title: 'Meditate for 10 minutes', time: 'Today, 8 PM', colorClass: 'bg-success' },
    { title: 'Meditate for 10 minutes', time: 'Today, 8 PM', colorClass: 'bg-success' },
  ];

  tasks30DaysDone = [{ title: 'Pay the rent', time: 'Today, 12 AM', colorClass: 'bg-danger' }];
}
