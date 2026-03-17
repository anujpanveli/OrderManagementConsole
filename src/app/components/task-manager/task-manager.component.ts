import { Component, OnInit, signal, inject } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-manager.component.html',
  styleUrl: './task-manager.component.css'
})
export class TaskManagerComponent implements OnInit {
  private taskService = inject(TaskService);
  tasks = signal<any[]>([]); // Signal for task list

  ngOnInit() {
    this.refreshTasks();
  }

  refreshTasks() {
    this.taskService.getTasksWithVariables()
      .subscribe(data => this.tasks.set(data));
  }

  // Handle "Approve Credit" (true) and "Reject Credit" (false)
  onAction(taskId: string, decision: boolean) {
    this.taskService.completeTask(taskId, decision).subscribe(() => {
      setTimeout(() => {
        window.location.reload();
        }, 1500);
    });
  }
}