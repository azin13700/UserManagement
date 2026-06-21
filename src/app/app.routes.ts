import { Routes } from "@angular/router";
import { LoginForm } from "./core/components/login-form/login-form";
import { MainLayout } from "./core/components/main-layout/main-layout";
import { SelectRole } from "./core/components/select-role/select-role";
import { RolePermission } from "./features/permissions/role-permission/role-permission";
import { RoleList } from "./features/roles/role-list/role-list";
import { UnitList } from "./features/units/unit-list/unit-list";
import { ListUser } from "./features/users/components/list-user/list-user";

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginForm,
  },
  {
    path: 'select-role',
    component: SelectRole,
  },
  {
    path: 'dashboard',
    component: MainLayout,
    children: [
      { path: 'list-user', component: ListUser },
      { path: 'role-permission', component: RolePermission },
      { path: 'list-role', component: RoleList },
      { path: 'list-unit', component: UnitList },
      { path: '', redirectTo: 'list-user', pathMatch: 'full' }
    ]
  }
];