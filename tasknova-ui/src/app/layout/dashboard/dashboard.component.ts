import { Component, inject, OnDestroy, OnInit } from "@angular/core";
import { MatTabsModule } from "@angular/material/tabs";
import { DepartmentComponent } from "../../features/department/department.component";
import { EmployeeComponent } from "../../features/employee/employee.component";
import { TaskComponent } from "../../features/task/task.component";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../../core/services/auth.service";
import { Route, Router } from "@angular/router";
import { User } from "../../core/models/auth";

@Component({
  selector: "app-dashboard",
  imports: [
    MatTabsModule,
    DepartmentComponent,
    EmployeeComponent,
    TaskComponent,
  ],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent implements OnInit, OnDestroy {
  isAdmin: boolean | undefined = false;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        this.isAdmin = user?.is_admin || user?.is_superuser;
      });
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
