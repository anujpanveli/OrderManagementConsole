import { Component, signal } from '@angular/core';
import { TaskManagerComponent } from './components/task-manager/task-manager.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TaskManagerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('order-manager-ui');
}
