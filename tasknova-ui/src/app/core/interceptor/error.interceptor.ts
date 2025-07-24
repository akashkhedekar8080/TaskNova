import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { Router } from "@angular/router";
import { catchError, switchMap, throwError } from "rxjs";

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = "An unexpected error occurred";

      switch (error.status) {
        case 401:
          // Try to refresh token first before logging out
          const authToken = authService.getAccessToken();
          if (authToken) {
            return authService.refreshToken().pipe(
              switchMap((refreshSuccess: boolean) => {
                if (refreshSuccess) {
                  // Retry the original request with the new token
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
              catchError(() => {
                // Refresh failed, logout user
                errorMessage = "Session expired. Please log in again";
                authService.performLogout();
                router.navigate(["/login"]);
                return throwError(() => ({
                  message: errorMessage,
                  status: error.status,
                  originalError: error,
                }));
              })
            );
          } else {
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
