import { Routes } from "@angular/router";
import { authGuard } from "./core/guards/auth.guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () =>
      import("./layout/dashboard/dashboard.component").then(
        (c) => c.DashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: "login",
    loadComponent: () =>
      import("./features/auth/login/login.component").then(
        (c) => c.LoginComponent
      ),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./features/auth/register/register.component").then(
        (c) => c.RegisterComponent
      ),
  },
];
