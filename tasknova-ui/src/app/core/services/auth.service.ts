import { inject, Injectable } from "@angular/core";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from "../models/auth";
import { BehaviorSubject, Observable, of, tap, map, catchError } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment.development";
import { ApiService } from "./api.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);
  private readonly baseUrl = `${environment.apiUrl}/api`;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.checkInitialAuthState()
  );
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(
    this.getStoredUser()
  );
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Initialize user data if token exists
    if (this.checkInitialAuthState() && !this.getStoredUser()) {
      this.loadUserProfile();
    }
  }

  private checkInitialAuthState(): boolean {
    const token = localStorage.getItem(environment.tokenKey);
    return token !== null;
  }

  private getStoredUser(): User | null {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user_data");
      }
    }
    return null;
  }

  private updateAuthState(isAuthenticated: boolean): void {
    this.isAuthenticatedSubject.next(isAuthenticated);
  }
  private loadUserProfile(): void {
    // Optional: Load user profile from API or localStorage
    // For now, we'll just set a basic user object
    const userData = localStorage.getItem("user_data");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService
      .post<LoginResponse, LoginRequest>(
        `${this.baseUrl}/accounts/token/`,
        credentials
      )
      .pipe(
        tap((response) => {
          localStorage.setItem(environment.tokenKey, response.access);
          localStorage.setItem(environment.refreshKey, response.refresh);

          // Store user data
          localStorage.setItem("user_data", JSON.stringify(response.user));

          // Update authentication state
          this.updateAuthState(true);
          this.currentUserSubject.next(response.user);
        })
      );
  }

  // User role checking methods
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user?.is_admin || false;
  }

  isStaff(): boolean {
    const user = this.currentUserSubject.value;
    return user?.is_staff || false;
  }

  isSuperuser(): boolean {
    const user = this.currentUserSubject.value;
    return user?.is_superuser || false;
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  // Observable versions for reactive programming
  isAdmin$(): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => user?.is_admin || false));
  }

  isStaff$(): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => user?.is_staff || false));
  }

  register(credentials: RegisterRequest): Observable<RegisterResponse> {
    return this.apiService
      .post<RegisterResponse, RegisterRequest>(
        `${this.baseUrl}/accounts/register/`,
        credentials
      )
      .pipe(
        tap((response) => {
          console.log(response);
          // Note: Don't update auth state here since user still needs to login
        })
      );
  }

  logout(): Observable<any> {
    return this.apiService.post(`${this.baseUrl}/auth/logout/`, {}).pipe(
      tap(() => this.performLogout()),
      catchError((error) => {
        // Even if logout API fails, perform local logout
        this.performLogout();
        return of(null);
      })
    );
  }

  performLogout(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.refreshKey);
    localStorage.removeItem("user_data");

    // Update authentication state
    this.updateAuthState(false);
    this.currentUserSubject.next(null);

    this.router.navigate(["/login"]);
  }

  // Synchronous method for immediate checks
  isAuthenticated(): Observable<boolean> {
    return this.isAuthenticated$;
  }

  // Alternative synchronous method if needed
  isAuthenticatedSync(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  refreshToken(): Observable<boolean> {
    const refreshToken = localStorage.getItem(environment.refreshKey);

    if (!refreshToken) {
      this.updateAuthState(false);
      return of(false);
    }

    return this.apiService
      .post<{ access: string }, { refresh: string }>(
        `${this.baseUrl}/token/refresh/`,
        { refresh: refreshToken }
      )
      .pipe(
        map((response) => {
          // Update the access token
          localStorage.setItem(environment.tokenKey, response.access);
          this.updateAuthState(true);
          return true;
        }),
        catchError((error) => {
          // Refresh token is expired or invalid
          console.error("Refresh token failed:", error);
          this.performLogout();
          return of(false);
        })
      );
  }

  // Method to manually refresh user profile
  refreshUserProfile(): Observable<User> {
    return this.apiService.get<User>(`${this.baseUrl}/user/profile/`).pipe(
      tap((user) => {
        localStorage.setItem("user_data", JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(environment.refreshKey);
  }

  setAccessToken(token: string): void {
    localStorage.setItem(environment.tokenKey, token);
    this.updateAuthState(true);
  }

  // Method to update user data
  updateUser(user: User): void {
    localStorage.setItem("user_data", JSON.stringify(user));
    this.currentUserSubject.next(user);
  }
}
