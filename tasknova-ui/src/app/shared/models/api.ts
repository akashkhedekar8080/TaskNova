// models/management.ts
export interface Department {
  id: number;
  slug: string;
  name: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  employee_count: number;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  image?: string;
  phone: string;
  designation: string;
  joining_date: string;
  department: Department;
  active_task_count: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  slug: string;
  title: string;
  description: string;
  status: "on_hold" | "in_progress" | "done" | "todo";
  priority: "low" | "medium" | "high" | "critical";
  due_date: string;
  is_spillover: boolean;
  estimated_sp: number;
  actual_sp?: number;
  created_at: string;
  updated_at: string;
  employee: Employee;
  employee_name: string;
  department_name: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: string;
  due_date: string;
  estimated_sp: number;
  employee_id: string;
}

export interface CreateDepartmentRequest {
  name: string;
  description: string;
}

export interface CreateEmployeeRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  designation: string;
  joining_date: string;
  department_id: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
