import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatTableModule } from "@angular/material/table";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule, MatDialog } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatNativeDateModule } from "@angular/material/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "../../core/services/auth.service";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { Employee, Task } from "../../shared/models/api";
import { ManagementService } from "../../shared/services/management.service";
import { User } from "../../core/models/auth";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "app-task",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: "./task.component.html",
  styleUrl: "./task.component.scss",
})
export class TaskComponent implements OnInit {
  @ViewChild("taskDialogTemplate") taskDialogTemplate!: TemplateRef<any>;

  tasks: Task[] = [];
  currentUser: User | null = null;

  employees: Employee[] = [];
  displayedColumns: string[] = [
    "title",
    "employee",
    "status",
    "priority",
    "due_date",
    "story_points",
  ];
  private destroy$ = new Subject<void>();
  taskForm: FormGroup;
  editingTask: Task | null = null;
  isLoading = false;

  constructor(
    private managementService: ManagementService,
    private authService: AuthService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.taskForm = this.fb.group({
      title: ["", Validators.required],
      description: [""],
      priority: ["medium", Validators.required],
      due_date: ["", Validators.required],
      estimated_sp: [1, [Validators.required, Validators.min(1)]],
      employee_id: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadEmployees();
    this.setupPermissions();
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get canCreateTask(): boolean {
    return this.authService.isAdmin() || this.authService.isStaff();
  }

  get canManageTasks(): boolean {
    return this.authService.isAdmin();
  }

  private setupPermissions(): void {
    if (this.canManageTasks) {
      this.displayedColumns.push("actions");
    }
  }
  updateTaskStatus(task: Task, newStatus: string): void {
    if (task.status === newStatus) return;

    this.managementService.updateTaskStatus(task.id, newStatus).subscribe({
      next: (updatedTask) => {
        // Update the task in the local array
        const index = this.tasks.findIndex((t) => t.id === task.id);
        if (index !== -1) {
          this.tasks[index] = updatedTask;
        }
        this.snackBar.open("Task status updated successfully", "Close", {
          duration: 3000,
        });
      },
      error: (error) => {
        this.snackBar.open("Failed to update task status", "Close", {
          duration: 3000,
        });
        console.error("Status update error:", error);
      },
    });
  }

  canUpdateTaskStatus(task: Task): boolean {
    // Allow admins to update any task, or users to update their own tasks
    return (
      this.authService.isAdmin() ||
      this.currentUser?.email === task.employee?.email
    );
  }
  loadTasks(): void {
    this.managementService.getTasks().subscribe({
      next: (tasks) => (this.tasks = tasks),
      error: (error) =>
        this.snackBar.open("Failed to load tasks", "Close", { duration: 3000 }),
    });
  }

  loadEmployees(): void {
    this.managementService.getEmployees().subscribe({
      next: (employees) => (this.employees = employees),
      error: (error) => console.error("Failed to load employees", error),
    });
  }

  openTaskDialog(task?: Task): void {
    this.editingTask = task || null;

    if (task) {
      this.taskForm.patchValue({
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: new Date(task.due_date),
        estimated_sp: task.estimated_sp,
        employee_id: task.employee?.id || "",
      });
    } else {
      this.taskForm.reset({
        priority: "medium",
        estimated_sp: 1,
      });
    }

    const dialogRef = this.dialog.open(this.taskDialogTemplate, {
      width: "600px",
      disableClose: true,
    });
  }

  saveTask(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      const formValue = this.taskForm.value;
      // Prepare task data with employee_id
      const taskData = {
        title: formValue.title,
        description: formValue.description,
        priority: formValue.priority,
        due_date: this.formatDate(formValue.due_date),
        estimated_sp: formValue.estimated_sp,
        employee_id: formValue.employee_id,
      };
      console.log(taskData);
      const operation = this.editingTask
        ? this.managementService.updateTask(this.editingTask.id, taskData)
        : this.managementService.createTask(taskData);

      operation.subscribe({
        next: (task) => {
          this.snackBar.open(
            `Task ${this.editingTask ? "updated" : "created"} successfully`,
            "Close",
            { duration: 3000 }
          );
          this.loadTasks(); // Refresh to get latest employee data
          this.dialog.closeAll();
        },
        error: (error) => {
          console.error("Task save error:", error);
          this.snackBar.open("Failed to save task", "Close", {
            duration: 3000,
          });
        },
        complete: () => (this.isLoading = false),
      });
    }
  }

  editTask(task: Task): void {
    this.openTaskDialog(task);
  }

  deleteTask(task: Task): void {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.managementService.deleteTask(task.id).subscribe({
        next: () => {
          this.snackBar.open("Task deleted successfully", "Close", {
            duration: 3000,
          });
          this.loadTasks();
        },
        error: () =>
          this.snackBar.open("Failed to delete task", "Close", {
            duration: 3000,
          }),
      });
    }
  }

  getStatusLabel(status: string): string {
    const labels = {
      on_hold: "On Hold",
      in_progress: "In Progress",
      completed: "Completed",
      todo: "Todo",
    };
    return labels[status as keyof typeof labels] || status;
  }

  getPriorityLabel(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  }

  isOverdue(dueDate: string): boolean {
    return new Date(dueDate) < new Date();
  }

  // Add refresh method
  refreshData(): void {
    this.managementService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.snackBar.open("Data refreshed", "Close", { duration: 2000 });
      },
      error: () =>
        this.snackBar.open("Failed to refresh data", "Close", {
          duration: 3000,
        }),
    });
  }

  // Add image error handler
  onImageError(event: any): void {
    // Set a default image when the original image fails to load
    event.target.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFMEUwRTAiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzIDQgMTQuMzQgNCAyMFYyMkgyMFYyMEMyMCAxNC4zNCAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo=";
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}
