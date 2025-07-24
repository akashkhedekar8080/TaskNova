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
import { MatBadgeModule } from "@angular/material/badge";
import { MatPaginatorModule } from "@angular/material/paginator";
import { Department, Employee } from "../../shared/models/api";
import { ManagementService } from "../../shared/services/management.service";
import { MatDatepickerModule } from "@angular/material/datepicker";

@Component({
  selector: "app-employee",
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
    MatBadgeModule,
    MatPaginatorModule,
  ],
  templateUrl: "./employee.component.html",
  styleUrl: "./employee.component.scss",
})
export class EmployeeComponent implements OnInit {
  employees: Employee[] = [];
  departments: Department[] = [];
  selectedEmployee: Employee | null = null;
  displayedColumns: string[] = [
    "employee",
    "department",
    "contact",
    "joining_date",
    "tasks",
    "actions",
  ];

  employeeForm: FormGroup;
  editingEmployee: Employee | null = null;
  isLoading = false;

  @ViewChild("employeeDialogTemplate")
  employeeDialogTemplate!: TemplateRef<any>;
  @ViewChild("employeeDetailTemplate")
  employeeDetailTemplate!: TemplateRef<any>;

  constructor(
    private managementService: ManagementService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.employeeForm = this.fb.group({
      first_name: ["", Validators.required],
      last_name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phone: ["", Validators.required],
      designation: ["", Validators.required],
      joining_date: ["", Validators.required],
      department_id: ["", Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadDepartments();
  }

  loadEmployees(): void {
    this.managementService.getEmployees().subscribe({
      next: (employees) => (this.employees = employees),
      error: (error) =>
        this.snackBar.open("Failed to load employees", "Close", {
          duration: 3000,
        }),
    });
  }

  loadDepartments(): void {
    this.managementService.getDepartments().subscribe({
      next: (departments) =>
        (this.departments = departments.filter((d) => d.is_active)),
      error: (error) => console.error("Failed to load departments", error),
    });
  }

  openEmployeeDialog(employee?: Employee): void {
    this.editingEmployee = employee || null;

    if (employee) {
      this.employeeForm.patchValue({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone,
        designation: employee.designation,
        joining_date: new Date(employee.joining_date),
        department_id: employee.department?.id || "",
      });
    } else {
      this.employeeForm.reset();
    }

    const dialogRef = this.dialog.open(this.employeeDialogTemplate, {
      width: "600px",
      disableClose: true,
    });
  }

  saveEmployee(): void {
    if (this.employeeForm.valid) {
      this.isLoading = true;
      const formValue = this.employeeForm.value;

      // Format date
      formValue.joining_date = this.formatDate(formValue.joining_date);

      if (this.editingEmployee) {
        this.managementService
          .updateEmployee(this.editingEmployee.id, formValue)
          .subscribe({
            next: () => {
              this.snackBar.open("Employee updated successfully", "Close", {
                duration: 3000,
              });
              this.loadEmployees();
              this.dialog.closeAll();
            },
            error: () =>
              this.snackBar.open("Failed to update employee", "Close", {
                duration: 3000,
              }),
            complete: () => (this.isLoading = false),
          });
      } else {
        this.managementService.createEmployee(formValue).subscribe({
          next: () => {
            this.snackBar.open("Employee added successfully", "Close", {
              duration: 3000,
            });
            this.loadEmployees();
            this.dialog.closeAll();
          },
          error: () =>
            this.snackBar.open("Failed to add employee", "Close", {
              duration: 3000,
            }),
          complete: () => (this.isLoading = false),
        });
      }
    }
  }

  viewEmployee(employee: Employee): void {
    this.selectedEmployee = employee;
    const dialogRef = this.dialog.open(this.employeeDetailTemplate, {
      width: "500px",
    });
  }

  editEmployee(employee: Employee): void {
    // Close any open dialogs first
    this.dialog.closeAll();
    // Add a small delay to ensure dialog is closed before opening new one
    setTimeout(() => {
      this.openEmployeeDialog(employee);
    }, 100);
  }

  editEmployeeFromDetail(): void {
    if (this.selectedEmployee) {
      const employeeToEdit = { ...this.selectedEmployee }; // Create a copy
      this.dialog.closeAll();
      setTimeout(() => {
        this.openEmployeeDialog(employeeToEdit);
      }, 100);
    }
  }

  onImageError(event: any): void {
    // Set a default image when the original image fails to load
    event.target.src =
      "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNFMEUwRTAiLz4KPHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0LjIwOTEgMTIgMTYgMTAuMjA5MSAxNiA4QzE2IDUuNzkwODYgMTQuMjA5MSA0IDEyIDRDOS43OTA4NiA0IDggNS43OTA4NiA4IDhDOCAxMC4yMDkxIDkuNzkwODYgMTIgMTIgMTJaIiBmaWxsPSIjOTk5OTk5Ii8+CjxwYXRoIGQ9Ik0xMiAxNEM5LjMzIDEzIDQgMTQuMzQgNCAyMFYyMkgyMFYyMEMyMCAxNC4zNCAxNC42NyAxNCAxMiAxNFoiIGZpbGw9IiM5OTk5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo=";
  }

  deleteEmployee(employee: Employee): void {
    if (confirm(`Are you sure you want to delete "${employee.full_name}"?`)) {
      this.managementService.deleteEmployee(employee.id).subscribe({
        next: () => {
          this.snackBar.open("Employee deleted successfully", "Close", {
            duration: 3000,
          });
          this.loadEmployees();
        },
        error: () =>
          this.snackBar.open("Failed to delete employee", "Close", {
            duration: 3000,
          }),
      });
    }
  }

  getTenure(joiningDate: string): string {
    const start = new Date(joiningDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      if (remainingMonths > 0) {
        return `${years} year${years > 1 ? "s" : ""}, ${remainingMonths} month${
          remainingMonths > 1 ? "s" : ""
        }`;
      }
      return `${years} year${years > 1 ? "s" : ""}`;
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}
