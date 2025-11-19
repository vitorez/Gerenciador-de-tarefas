import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  @Output() statsChanged = new EventEmitter<{ completedToday: number; totalTasks: number }>();

  private taskService = inject(TaskService);

  tasks: Task[] = [];
  currentTask: Task = this.getEmptyTask();
  isSidebarVisible = false;
  isEditMode = false;
  searchTerm = '';
  currentFilter: 'all' | 'pending' | 'completed' = 'all';

  //puxa os dados iniciais do banco
  ngOnInit() {
    this.loadTasks();
  }
  //aqui faz a conexao com o back
  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (data) => {
        this.tasks = data;
        this.emitStats();
        console.log('Dados carregados do SQL Server:', data);
      },
      error: (err) => console.error('Erro ao carregar tarefas:', err),
    });
  }

  saveTask() {
    if (!this.currentTask.title.trim()) {
      alert('⚠️ Please enter a task title');
      return;
    }

    //chama o backend passando a tarefa que foi atualizada
    if (this.isEditMode) {
      this.taskService.updateTask(this.currentTask).subscribe({
        next: () => {
          console.log('Tarefa editada salva no banco!');
          this.loadTasks();
          this.closeEditor();
        },
        error: (err) => console.error('Erro ao editar:', err),
      });
    } else {
      this.taskService.createTask(this.currentTask).subscribe({
        next: () => {
          console.log('Nova tarefa criada!');
          this.loadTasks();
          this.closeEditor();
        },
        error: (err) => console.error('Erro ao criar:', err),
      });
    }
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesFilter =
        this.currentFilter === 'all' ||
        (this.currentFilter === 'completed' && task.completed) ||
        (this.currentFilter === 'pending' && !task.completed);
      return matchesSearch && matchesFilter;
    });
  }

  get filteredTodayTasks(): Task[] {
    return this.filteredTasks.filter((t) => t.section === 'today');
  }

  get filteredWeekTasks(): Task[] {
    return this.filteredTasks.filter((t) => t.section === 'week');
  }

  get filteredMonthTasks(): Task[] {
    return this.filteredTasks.filter((t) => t.section === 'month');
  }

  get todayTasksCount(): number {
    return this.tasks.filter((t) => t.section === 'today').length;
  }

  get completedTodayCount(): number {
    return this.tasks.filter((t) => t.section === 'today' && t.completed).length;
  }

  get todayProgressPercent(): number {
    const total = this.todayTasksCount;
    return total ? Math.round((this.completedTodayCount / total) * 100) : 0;
  }

  get weekProgressPercent(): number {
    const weekTasks = this.tasks.filter((t) => t.section === 'week');
    const completedWeek = weekTasks.filter((t) => t.completed).length;
    return weekTasks.length ? Math.round((completedWeek / weekTasks.length) * 100) : 0;
  }

  get monthProgressPercent(): number {
    const monthTasks = this.tasks.filter((t) => t.section === 'month');
    const completedMonth = monthTasks.filter((t) => t.completed).length;
    return monthTasks.length ? Math.round((completedMonth / monthTasks.length) * 100) : 0;
  }

  onSearchChange() {}

  setFilter(filter: 'all' | 'pending' | 'completed') {
    this.currentFilter = filter;
  }

  toggleTask(task: Task) {
    // 1. Muda visualmente na hora (para ficar rápido pro usuário)
    task.completed = !task.completed;

    // 2. Manda pro Backend salvar
    this.taskService.updateTask(task).subscribe({
      next: () => {
        console.log(`Tarefa ${task.id} atualizada com sucesso!`);
        this.emitStats(); // Recalcula as barrinhas de progresso
      },
      error: (err) => {
        console.error('Erro ao atualizar:', err);
        // Se der erro, desfaz a mudança visual para não enganar o usuário
        task.completed = !task.completed;
      },
    });
  }

  openEditor(task?: Task) {
    if (task) {
      this.isEditMode = true;
      this.currentTask = {
        ...task,
        timeRaw: this.convertTimeToInput(task.time || ''),
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

  deleteTask() {
    if (confirm('🗑️ Are you sure you want to delete this task?')) {
      // Aqui futuramente chamaremos o this.taskService.deleteTask(id)
      // Por enquanto remove local:
      this.tasks = this.tasks.filter((t) => t.id !== this.currentTask.id);
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
      completed: false,
    };
  }

  private emitStats() {
    this.statsChanged.emit({
      completedToday: this.completedTodayCount,
      totalTasks: this.tasks.length,
    });
  }
}
