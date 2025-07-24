import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  constructor(private http: HttpClient) {}

  get<R>(url: string, params?: HttpParams): Observable<R> {
    return this.http.get<R>(url, { params }).pipe(
      map((response) => response),
      catchError((error) => this.handleError(error))
    );
  }
  post<R, D>(url: string, body: D): Observable<R> {
    return this.http.post<R>(url, body).pipe(
      map((response) => response),
      catchError((error) => this.handleError(error))
    );
  }
  put<T, D>(url: string, body: D): Observable<T> {
    return this.http.put<T>(url, body).pipe(
      map((response) => response),
      catchError((error) => this.handleError(error))
    );
  }
  patch<T, D>(url: string, body: D): Observable<T> {
    return this.http.patch<T>(url, body).pipe(
      map((response) => response),
      catchError((error) => this.handleError(error))
    );
  }
  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(url).pipe(
      map((response) => response),
      catchError((error) => this.handleError(error))
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage: string;

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${
        error.statusText || "An error occurred"
      }`;

      // Optional detailed message from server
      if (typeof error.error === "string") {
        errorMessage += `\nDetails: ${error.error}`;
      } else if (error.error?.message) {
        errorMessage += `\nDetails: ${error.error.message}`;
      }
    }

    console.error("API Error:", errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
