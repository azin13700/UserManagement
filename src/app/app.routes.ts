import { Routes } from "@angular/router";
import { LoginForm } from "./core/components/login-form/login-form";
import { MainLayout } from "./core/components/main-layout/main-layout";
import { SelectRole } from "./core/components/select-role/select-role";
import { RolePermission } from "./features/permissions/role-permission/role-permission";
import { RoleList } from "./features/roles/role-list/role-list";
import { UnitList } from "./features/units/unit-list/unit-list";
import { ListUser } from "./features/users/components/list-user/list-user";
import { ListSubject } from "./features/subject/list-subject/list-subject";
import { RequestPage } from "./features/request/request-page/request-page";
import { Dashboard } from "./features/dashboard/dashboard/dashboard";
import { Home } from "./features/home/home";
import { ListState } from "./features/state/list-state/list-state";

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
      { path: 'list-subject', component: ListSubject },
      {path:'list-state',component:ListState},
      {path:'request',component:RequestPage},
      { path: '', pathMatch: 'full' , component:Home},
      { 
        path: 'workflow', 
        component: Dashboard 
      },
    ]
  }
];