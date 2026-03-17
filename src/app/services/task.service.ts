import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private baseUrl = '/v2';
  private headers = new HttpHeaders({});

  // Step 1: Fetch tasks
  // Step 2: For each task, fetch its process variables
  // Step 3: Merge orderId + amount into the task object
  getTasksWithVariables(): Observable<any[]> {
    return this.http.post<{ items: any[] }>(
      `${this.baseUrl}/user-tasks/search`,
      { filter: { elementId: 'manager_review_task', state: 'CREATED' } },
      { headers: this.headers }
    ).pipe(
      map(res => res.items ?? []),
      switchMap(tasks => {
        if (tasks.length === 0) return [[]];

        // For each task, fire a variables search using processInstanceKey
        const variableRequests = tasks.map(task =>
          this.http.post<{ items: any[] }>(
            `${this.baseUrl}/variables/search`,
            { filter: { processInstanceKey: task.processInstanceKey } },
            { headers: this.headers }
          ).pipe(
            map(res => {
              // Convert variable array into a key-value map
              const vars: any = {};
              (res.items ?? []).forEach((v: any) => vars[v.name] = v.value);

              // Merge variables into the task object
              return {
                ...task,
                orderId: vars['orderId'] ?? 'N/A',
                amount:  vars['amount']  ?? 'N/A'
              };
            })
          )
        );

        // Wait for ALL variable requests to complete
        return forkJoin(variableRequests);
      })
    );
  }

  completeTask(taskId: string, approved: boolean): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/user-tasks/${taskId}/completion`,
      { variables: { approved } },
      { headers: this.headers }
    );
  }
}