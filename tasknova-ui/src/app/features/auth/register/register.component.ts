import { Component, OnInit } from "@angular/core";
import { AbstractControl, ReactiveFormsModule } from "@angular/forms";
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
  selector: "app-register",
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
  templateUrl: "./register.component.html",
  styleUrl: "./register.component.scss",
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  isLoading = false;
  registerError = "";

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        username: ["", [Validators.required, Validators.minLength(2)]],
        email: ["", [Validators.required, Validators.email]],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(8),
            this.passwordValidator,
          ],
        ],
        confirmPassword: ["", [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordValidator(control: AbstractControl): { [key: string]: any } | null {
    const password = control.value;
    if (!password) return null;

    const hasNumber = /[0-9]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);

    const valid = hasNumber && hasUpper && hasLower;
    if (!valid) {
      return { passwordStrength: true };
    }
    return null;
  }

  passwordMatchValidator(
    control: AbstractControl
  ): { [key: string]: any } | null {
    const password = control.get("password");
    const confirmPassword = control.get("confirmPassword");

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.registerError = "";

      // Remove confirmPassword before sending to API
      const formValue = { ...this.registerForm.value };
      delete formValue.confirmPassword;

      this.authService.register(formValue).subscribe({
        next: (response) => {
          console.log("Registration successful:", response);
          this.isLoading = false;

          // Show success message
          this.snackBar.open(
            "Registration successful! Please login.",
            "Close",
            {
              duration: 5000,
              panelClass: ["success-snackbar"],
            }
          );

          // Navigate to login page
          this.router.navigate(["/login"]);
        },
        error: (error) => {
          console.error("Registration failed:", error);
          this.isLoading = false;

          // Set error message based on error type
          if (error.message.includes("400")) {
            if (error.message.toLowerCase().includes("username")) {
              this.registerError = "Username already exists";
            } else if (error.message.toLowerCase().includes("email")) {
              this.registerError = "Email already exists";
            } else {
              this.registerError = "Please check your input data";
            }
          } else if (error.message.includes("Server Error")) {
            this.registerError = "Server error. Please try again later.";
          } else {
            this.registerError = "Registration failed. Please try again.";
          }

          // Show error snackbar
          this.snackBar.open(this.registerError, "Close", {
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
    const field = this.registerForm.get(fieldName);

    if (field?.hasError("required")) {
      return `${this.formatFieldName(fieldName)} is required`;
    }
    if (field?.hasError("email")) {
      return "Please enter a valid email";
    }
    if (field?.hasError("minlength")) {
      const minLength = field.errors?.["minlength"].requiredLength;
      return `${this.formatFieldName(
        fieldName
      )} must be at least ${minLength} characters`;
    }
    if (field?.hasError("passwordStrength")) {
      return "Password must contain uppercase, lowercase, and number";
    }
    if (
      fieldName === "confirmPassword" &&
      this.registerForm.hasError("passwordMismatch")
    ) {
      return "Passwords do not match";
    }
    return "";
  }

  private formatFieldName(fieldName: string): string {
    switch (fieldName) {
      case "firstName":
        return "First name";
      case "lastName":
        return "Last name";
      case "confirmPassword":
        return "Confirm password";
      default:
        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  navigateToLogin(): void {
    this.router.navigate(["/login"]);
  }

  // Clear register error when user starts typing
  onInputChange(): void {
    if (this.registerError) {
      this.registerError = "";
    }
  }
}
