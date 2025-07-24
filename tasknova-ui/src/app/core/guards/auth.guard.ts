import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { catchError, map, of, switchMap, take } from "rxjs";
import { AuthService } from "../services/auth.service";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    switchMap((isAuthenticated: boolean) => {
      if (isAuthenticated) {
        return of(true);
      }

      // Try to refresh the token if not authenticated
      return authService.refreshToken().pipe(
        map((refreshSuccess: boolean) => {
          if (refreshSuccess) {
            return true;
          }
          // Refresh failed - redirect to login and clear any stored tokens
          authService.performLogout();
          return router.createUrlTree(["/login"]);
        }),
        catchError(() => {
          // Refresh token expired or other error - redirect to login
          authService.performLogout();
          return of(router.createUrlTree(["/login"]));
        })
      );
    })
  );
};
