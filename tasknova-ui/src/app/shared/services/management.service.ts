// services/management.service.ts
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { ApiService } from "../../core/services/api.service";
import {
  Task,
  Employee,
  Department,
  CreateDepartmentRequest,
  CreateTaskRequest,
  CreateEmployeeRequest,
} from "../models/api";
@Injectable({
  providedIn: "root",
})
export class ManagementService {
  private readonly apiService = inject(ApiService);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  // Task Methods
  getTasks(): Observable<Task[]> {
    return this.apiService.get<Task[]>(`${this.baseUrl}/tasks/`);
  }

  getTask(id: number): Observable<Task> {
    return this.apiService.get<Task>(`${this.baseUrl}/tasks/${id}/`);
  }

  createTask(task: CreateTaskRequest): Observable<Task> {
    console.log("task", task);
    return this.apiService.post<Task, CreateTaskRequest>(
      `${this.baseUrl}/tasks/`,
      task
    );
  }

  updateTask(id: number, task: Partial<CreateTaskRequest>): Observable<Task> {
    return this.apiService.put<Task, Partial<CreateTaskRequest>>(
      `${this.baseUrl}/tasks/${id}/`,
      task
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/tasks/${id}/`);
  }

  getTasksByEmployee(employeeId: number): Observable<Task[]> {
    return this.apiService.get<Task[]>(
      `${this.baseUrl}/tasks/?employee=${employeeId}`
    );
  }

  getTasksByDepartment(departmentId: number): Observable<Task[]> {
    return this.apiService.get<Task[]>(
      `${this.baseUrl}/tasks/?department=${departmentId}`
    );
  }

  updateTaskStatus(id: number, status: string): Observable<Task> {
    return this.apiService.patch<Task, { status: string }>(
      `${this.baseUrl}/tasks/${id}/`,
      { status }
    );
  }

  // Department Methods
  getDepartments(): Observable<Department[]> {
    return this.apiService.get<Department[]>(`${this.baseUrl}/departments/`);
  }

  getDepartment(id: number): Observable<Department> {
    return this.apiService.get<Department>(
      `${this.baseUrl}/departments/${id}/`
    );
  }

  createDepartment(
    department: CreateDepartmentRequest
  ): Observable<Department> {
    return this.apiService.post<Department, CreateDepartmentRequest>(
      `${this.baseUrl}/departments/`,
      department
    );
  }

  updateDepartment(
    id: number,
    department: Partial<Department>
  ): Observable<Department> {
    return this.apiService.put<Department, Partial<Department>>(
      `${this.baseUrl}/departments/${id}/`,
      department
    );
  }

  deleteDepartment(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/departments/${id}/`);
  }

  getActiveDepartments(): Observable<Department[]> {
    return this.apiService.get<Department[]>(
      `${this.baseUrl}/departments/?is_active=true`
    );
  }

  // Employee Methods
  getEmployees(): Observable<Employee[]> {
    return this.apiService.get<Employee[]>(`${this.baseUrl}/employees/`);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.apiService.get<Employee>(`${this.baseUrl}/employees/${id}/`);
  }

  createEmployee(employee: CreateEmployeeRequest): Observable<Employee> {
    return this.apiService.post<Employee, CreateEmployeeRequest>(
      `${this.baseUrl}/employees/`,
      employee
    );
  }

  updateEmployee(
    id: number,
    employee: Partial<CreateEmployeeRequest>
  ): Observable<Employee> {
    return this.apiService.put<Employee, Partial<CreateEmployeeRequest>>(
      `${this.baseUrl}/employees/${id}/`,
      employee
    );
  }

  deleteEmployee(id: number): Observable<void> {
    return this.apiService.delete<void>(`${this.baseUrl}/employees/${id}/`);
  }

  getEmployeesByDepartment(departmentId: number): Observable<Employee[]> {
    return this.apiService.get<Employee[]>(
      `${this.baseUrl}/employees/?department=${departmentId}`
    );
  }

  uploadEmployeeImage(
    employeeId: number,
    imageFile: File
  ): Observable<Employee> {
    const formData = new FormData();
    formData.append("image", imageFile);

    return this.apiService.patch<Employee, FormData>(
      `${this.baseUrl}/employees/${employeeId}/upload-image/`,
      formData
    );
  }

  // Dashboard/Statistics Methods
  getDashboardStats(): Observable<{
    total_tasks: number;
    completed_tasks: number;
    pending_tasks: number;
    in_progress_tasks: number;
    total_employees: number;
    total_departments: number;
    recent_tasks: Task[];
    top_performers: Employee[];
  }> {
    return this.apiService.get(`${this.baseUrl}/dashboard/stats/`);
  }

  getTaskStatsByDepartment(): Observable<
    {
      department: string;
      total_tasks: number;
      completed_tasks: number;
      pending_tasks: number;
    }[]
  > {
    return this.apiService.get(
      `${this.baseUrl}/dashboard/tasks-by-department/`
    );
  }

  getEmployeePerformance(): Observable<
    {
      employee: string;
      completed_tasks: number;
      average_completion_time: number;
      efficiency_score: number;
    }[]
  > {
    return this.apiService.get(
      `${this.baseUrl}/dashboard/employee-performance/`
    );
  }

  // Search Methods
  searchTasks(query: string): Observable<Task[]> {
    return this.apiService.get<Task[]>(
      `${this.baseUrl}/tasks/search/?q=${encodeURIComponent(query)}`
    );
  }

  searchEmployees(query: string): Observable<Employee[]> {
    return this.apiService.get<Employee[]>(
      `${this.baseUrl}/employees/search/?q=${encodeURIComponent(query)}`
    );
  }

  searchDepartments(query: string): Observable<Department[]> {
    return this.apiService.get<Department[]>(
      `${this.baseUrl}/departments/search/?q=${encodeURIComponent(query)}`
    );
  }

  // Bulk Operations
  bulkUpdateTaskStatus(
    taskIds: number[],
    status: string
  ): Observable<{ updated_count: number }> {
    return this.apiService.post(`${this.baseUrl}/tasks/bulk-update-status/`, {
      task_ids: taskIds,
      status: status,
    });
  }

  bulkAssignTasks(
    taskIds: number[],
    employeeId: number
  ): Observable<{ updated_count: number }> {
    return this.apiService.post(`${this.baseUrl}/tasks/bulk-assign/`, {
      task_ids: taskIds,
      employee_id: employeeId,
    });
  }

  // exportEmployees(format: "csv" | "excel" = "csv"): Observable<Blob> {
  //   return this.apiService.get(
  //     `${this.baseUrl}/employees/export/?format=${format}`,
  //     undefined,
  //     {
  //       responseType: "blob",
  //     }
  //   );
  // }

  // exportTasks(format: "csv" | "excel" = "csv"): Observable<Blob> {
  //   return this.apiService.get(
  //     `${this.baseUrl}/tasks/export/?format=${format}`,
  //     undefined,
  //     {
  //       responseType: "blob",
  //     }
  //   );
  // }
}
