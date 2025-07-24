import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { catchError, switchMap, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Skip interception for refresh token request to avoid infinite loops
  if (req.url.includes("/refresh-token")) {
    return next(req);
  }

  let isRefreshing = false;

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = "An unexpected error occurred";

      switch (error.status) {
        case 401:
          const authToken = authService.getAccessToken();
          // Only attempt refresh if we have a token and not already refreshing
          if (authToken && !isRefreshing) {
            isRefreshing = true;
            return authService.refreshToken().pipe(
              switchMap((refreshSuccess: boolean) => {
                isRefreshing = false;
                if (refreshSuccess) {
                  const newToken = authService.getAccessToken();
                  const retryReq = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`,
                    },
                  });
                  return next(retryReq);
                } else {
                  // Refresh failed, logout user
                  errorMessage = "Session expired. Please log in again";
                  authService.performLogout();
                  router.navigate(["/login"]);
                  return throwError(() => ({
                    message: errorMessage,
                    status: error.status,
                    originalError: error,
                  }));
                }
              }),
              catchError((refreshError) => {
                isRefreshing = false;
                // Refresh failed, logout user
                errorMessage = "Session expired. Please log in again";
                authService.performLogout();
                router.navigate(["/login"]);
                return throwError(() => ({
                  message: errorMessage,
                  status: error.status,
                  originalError: refreshError,
                }));
              })
            );
          } else {
            // No token or already refreshing - just logout
            errorMessage = "Please log in to continue";
            authService.performLogout();
            router.navigate(["/login"]);
          }
          break;
        case 403:
          errorMessage = "You do not have permission to perform this action";
          break;
        case 422:
          if (error.error?.detail) {
            errorMessage = error.error.detail;
          } else {
            errorMessage = "Invalid data provided";
          }
          break;
        case 500:
          errorMessage = "Internal server error. Please try again later";
          break;
      }

      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        originalError: error,
      }));
    })
  );
};
