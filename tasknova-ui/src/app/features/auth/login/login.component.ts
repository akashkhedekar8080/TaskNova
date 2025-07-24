import { Component, OnInit } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule, MatSnackBar } from "@angular/material/snack-bar";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-login",
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: "./login.component.html",
  styleUrl: "./login.component.scss",
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  hidePassword = true;
  isLoading = false;
  loginError = "";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ["", [Validators.required, Validators.minLength(4)]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.loginError = "";

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log("Login successful:", response);
          this.isLoading = false;

          // Show success message
          this.snackBar.open("Login successful!", "Close", {
            duration: 3000,
            panelClass: ["success-snackbar"],
          });

          // Navigate to dashboard or protected route
          this.router.navigate(["/"]); // Change to your desired route
        },
        error: (error) => {
          console.error("Login failed:", error);
          this.isLoading = false;

          // Set error message based on error type
          if (error.message.includes("401")) {
            this.loginError = "Invalid username or password";
          } else if (error.message.includes("400")) {
            this.loginError = "Please check your credentials";
          } else if (error.message.includes("Server Error")) {
            this.loginError = "Server error. Please try again later.";
          } else {
            this.loginError = "Login failed. Please try again.";
          }

          // Show error snackbar
          this.snackBar.open(this.loginError, "Close", {
            duration: 5000,
            panelClass: ["error-snackbar"],
          });
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.loginForm.get(fieldName);
    if (field?.hasError("required")) {
      return `${fieldName} is required`;
    }
    if (field?.hasError("email")) {
      return "Please enter a valid email";
    }
    if (field?.hasError("minlength")) {
      const minLength = field.getError("minlength")?.requiredLength;
      return `${fieldName} must be at least ${minLength} characters`;
    }
    return "";
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  navigateToRegister(): void {
    this.router.navigate(["/register"]);
  }

  // Clear login error when user starts typing
  onInputChange(): void {
    if (this.loginError) {
      this.loginError = "";
    }
  }
}
