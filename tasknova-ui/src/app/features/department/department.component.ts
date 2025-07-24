import {
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
  viewChild,
} from "@angular/core";
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
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatBadgeModule } from "@angular/material/badge";
import { Department } from "../../shared/models/api";
import { ManagementService } from "../../shared/services/management.service";

@Component({
  selector: "app-department",
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
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
  ],
  templateUrl: "./department.component.html",
  styleUrl: "./department.component.scss",
})
export class DepartmentComponent implements OnInit {
  departments: Department[] = [];
  departmentForm: FormGroup;
  editingDepartment: Department | null = null;
  isLoading = false;
  @ViewChild("departmentDialogTemplate")
  departmentDialogTemplate!: TemplateRef<any>;
  constructor(
    private managementService: ManagementService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.departmentForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(2)]],
      description: ["", Validators.required],
      is_active: [true],
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.managementService.getDepartments().subscribe({
      next: (departments) => (this.departments = departments),
      error: (error) =>
        this.snackBar.open("Failed to load departments", "Close", {
          duration: 3000,
        }),
    });
  }

  openDepartmentDialog(department?: Department): void {
    this.editingDepartment = department || null;

    if (department) {
      this.departmentForm.patchValue({
        name: department.name,
        description: department.description,
        is_active: department.is_active,
      });
    } else {
      this.departmentForm.reset({
        is_active: true,
      });
    }

    const dialogRef = this.dialog.open(this.departmentDialogTemplate, {
      width: "500px",
      disableClose: true,
    });
  }

  saveDepartment(): void {
    if (this.departmentForm.valid) {
      this.isLoading = true;
      const formValue = this.departmentForm.value;

      if (this.editingDepartment) {
        this.managementService
          .updateDepartment(this.editingDepartment.id, formValue)
          .subscribe({
            next: () => {
              this.snackBar.open("Department updated successfully", "Close", {
                duration: 3000,
              });
              this.loadDepartments();
              this.dialog.closeAll();
            },
            error: () =>
              this.snackBar.open("Failed to update department", "Close", {
                duration: 3000,
              }),
            complete: () => (this.isLoading = false),
          });
      } else {
        this.managementService.createDepartment(formValue).subscribe({
          next: () => {
            this.snackBar.open("Department created successfully", "Close", {
              duration: 3000,
            });
            this.loadDepartments();
            this.dialog.closeAll();
          },
          error: () =>
            this.snackBar.open("Failed to create department", "Close", {
              duration: 3000,
            }),
          complete: () => (this.isLoading = false),
        });
      }
    }
  }

  editDepartment(department: Department): void {
    this.openDepartmentDialog(department);
  }

  deleteDepartment(department: Department): void {
    if (confirm(`Are you sure you want to delete "${department.name}"?`)) {
      this.managementService.deleteDepartment(department.id).subscribe({
        next: () => {
          this.snackBar.open("Department deleted successfully", "Close", {
            duration: 3000,
          });
          this.loadDepartments();
        },
        error: () =>
          this.snackBar.open("Failed to delete department", "Close", {
            duration: 3000,
          }),
      });
    }
  }

  toggleStatus(department: Department): void {
    const newStatus = !department.is_active;
    this.managementService
      .updateDepartment(department.id, { ...department, is_active: newStatus })
      .subscribe({
        next: () => {
          department.is_active = newStatus;
          this.snackBar.open(
            `Department ${newStatus ? "activated" : "deactivated"}`,
            "Close",
            { duration: 3000 }
          );
        },
        error: () =>
          this.snackBar.open("Failed to update department status", "Close", {
            duration: 3000,
          }),
      });
  }

  viewEmployees(department: Department): void {
    // Navigate to employees with department filter
    // this.router.navigate(['/employees'], { queryParams: { department: department.id } });
    this.snackBar.open(`Viewing employees for ${department.name}`, "Close", {
      duration: 3000,
    });
  }
}
