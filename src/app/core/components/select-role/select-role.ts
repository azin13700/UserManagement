// core/components/select-role/select-role.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../services/api-service';
import { AuthService } from '../../services/auth-service';
import { LoginResponse, LoginRole } from '../../models/LoginRequest';
import { lastValueFrom } from 'rxjs';



@Component({
  selector: 'app-select-role',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './select-role.html',
  styleUrls: ['./select-role.scss']
})
export class SelectRole implements OnInit {

  roles: LoginRole[] = [];

  selectedRoleId: number | null = null;

  loading = false;

  fullName = '';

  userData: LoginResponse | null = null;

  noPermission = false;

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.userData = this.authService.getUserData();

    this.fullName = this.userData?.fullName ?? '';

    this.roles = this.userData?.roles ?? [];

    if (this.roles.length === 1) {
      this.selectedRoleId = this.roles[0].roleId;
      this.onSelectRole();
    }
  }

  async onSelectRole() {

    if (!this.selectedRoleId) {

      this.messageService.add({
        severity: 'warn',
        summary: 'خطا',
        detail: 'لطفاً یک نقش را انتخاب کنید'
      });

      return;
    }

    this.loading = true;

    try {

      const response = await lastValueFrom(
        this.api.selectRole({
          userId: this.authService.getUserId()!,
          roleId: this.selectedRoleId
        })
      );

      this.authService.setSelectedRole(response);

      if ((response.permissions ?? []).length === 0) {
        this.noPermission = true;
        return;
      }

      this.router.navigate(['/dashboard']);

    } catch (err: any) {

      this.messageService.add({
        severity: 'error',
        summary: 'خطا',
        detail: err.error?.message ?? 'خطا'
      });

    } finally {

      this.loading = false;
    }

  }

  logout() {
    this.authService.logout();
  }

}