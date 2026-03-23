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
    // 1. Optimistic UI update: Remove task from local list immediately
    this.tasks.update(currentTasks => currentTasks.filter(t => t.id !== taskId));

    // 2. Call the service to complete the task in the cloud
    this.taskService.completeTask(taskId, decision).subscribe({
      next: () => {
        // 3. Instead of reload, wait for the cloud indexer to sync
        // then refresh the data in the background
        setTimeout(() => {
          this.refreshTasks();
        }, 2000); // 2 seconds is safer for SaaS
      },
      error: (err) => {
        // 4. Rollback: If the server call fails, put the task back or alert the user
        console.error('Task completion failed:', err);
        alert('Action failed. Refreshing list...');
        this.refreshTasks();
      }
    });
  }
}