import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Task {
  id: number;
  title: string;
  description?: string;
  category?: string;
  date?: string;
  time?: string;
  timeRaw?: string;
  section: 'today' | 'week' | 'month';
  color: string;
  completed: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})

export class DashboardComponent implements OnInit {
  @Output() statsChanged = new EventEmitter<{ completedToday: number; totalTasks: number }>();

  tasks: Task[] = [];
  currentTask: Task = this.getEmptyTask();
  isSidebarVisible = false;
  isEditMode = false;
  searchTerm = '';
  currentFilter: 'all' | 'pending' | 'completed' = 'all';

  ngOnInit() {
    this.emitStats();
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesFilter =
        this.currentFilter === 'all' ||
        (this.currentFilter === 'completed' && task.completed) ||
        (this.currentFilter === 'pending' && !task.completed);
      return matchesSearch && matchesFilter;
    });
  }

  get filteredTodayTasks(): Task[] {
    return this.filteredTasks.filter(t => t.section === 'today');
  }

  get filteredWeekTasks(): Task[] {
    return this.filteredTasks.filter(t => t.section === 'week');
  }

  get filteredMonthTasks(): Task[] {
    return this.filteredTasks.filter(t => t.section === 'month');
  }

  get todayTasksCount(): number {
    return this.tasks.filter(t => t.section === 'today').length;
  }

  get completedTodayCount(): number {
    return this.tasks.filter(t => t.section === 'today' && t.completed).length;
  }

  get todayProgressPercent(): number {
    const total = this.todayTasksCount;
    return total ? Math.round((this.completedTodayCount / total) * 100) : 0;
  }

  get weekProgressPercent(): number {
    const weekTasks = this.tasks.filter(t => t.section === 'week');
    const completedWeek = weekTasks.filter(t => t.completed).length;
    return weekTasks.length ? Math.round((completedWeek / weekTasks.length) * 100) : 0;
  }

  get monthProgressPercent(): number {
    const monthTasks = this.tasks.filter(t => t.section === 'month');
    const completedMonth = monthTasks.filter(t => t.completed).length;
    return monthTasks.length ? Math.round((completedMonth / monthTasks.length) * 100) : 0;
  }

  onSearchChange() {
    // Método chamado quando o termo de busca muda
  }

  setFilter(filter: 'all' | 'pending' | 'completed') {
    this.currentFilter = filter;
  }

  toggleTask(task: Task) {
    task.completed = !task.completed;
    this.emitStats();
  }

  openEditor(task?: Task) {
    if (task) {
      this.isEditMode = true;
      this.currentTask = {
        ...task,
        timeRaw: this.convertTimeToInput(task.time || '')
      };
    } else {
      this.isEditMode = false;
      this.currentTask = this.getEmptyTask();
    }
    this.isSidebarVisible = true;
  }

  closeEditor() {
    this.isSidebarVisible = false;
    this.currentTask = this.getEmptyTask();
  }

  saveTask() {
    if (!this.currentTask.title.trim()) {
      alert('⚠️ Please enter a task title');
      return;
    }

    if (this.isEditMode) {
      const index = this.tasks.findIndex(t => t.id === this.currentTask.id);
      if (index !== -1) {
        this.tasks[index] = { ...this.currentTask };
      }
    } else {
      this.currentTask.id = Date.now();
      this.tasks.push({ ...this.currentTask });
    }

    this.emitStats();
    this.closeEditor();
  }

  deleteTask() {
    if (confirm('🗑️ Are you sure you want to delete this task?')) {
      this.tasks = this.tasks.filter(t => t.id !== this.currentTask.id);
      this.emitStats();
      this.closeEditor();
    }
  }

  selectColor(color: string) {
    this.currentTask.color = color;
  }

  formatTimeInput() {
    if (this.currentTask.timeRaw) {
      const [hours, minutes] = this.currentTask.timeRaw.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      this.currentTask.time = `${displayHour}:${minutes} ${ampm}`;
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    }
  }

  private convertTimeToInput(time: string): string {
    if (!time || !time.includes(':')) return '';
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return '';
    
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  private getEmptyTask(): Task {
    return {
      id: 0,
      title: '',
      description: '',
      category: '',
      date: '',
      time: '',
      timeRaw: '',
      section: 'today',
      color: 'green',
      completed: false
    };
  }

  private emitStats() {
    this.statsChanged.emit({
      completedToday: this.completedTodayCount,
      totalTasks: this.tasks.length
    });
  }
}
