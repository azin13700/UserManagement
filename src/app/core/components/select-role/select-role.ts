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
import { LoginResponse } from '../../models/LoginRequest';
import { lastValueFrom } from 'rxjs';

// ✅ نقش‌های کامل (هم فارسی و هم انگلیسی)
const ROLE_MAP: { [key: string]: { id: number; description: string } } = {
  // ===== انگلیسی =====
  'Admin': { id: 1, description: 'دسترسی کامل به تمام بخش‌های سیستم' },
  'Manager': { id: 2, description: 'مدیریت کاربران و نقش‌ها' },
  'Expert': { id: 3, description: 'دسترسی به محتوا و گزارشات' },
  'Auditor': { id: 4, description: 'دسترسی به گزارشات مالی' },
  'Guest': { id: 5, description: 'دسترسی محدود' },
  'User': { id: 6, description: 'دسترسی پایه به سیستم' },
  
  // ===== فارسی =====
  'ادمین': { id: 1, description: 'دسترسی کامل به تمام بخش‌های سیستم' },
  'مدیر': { id: 2, description: 'مدیریت کاربران و نقش‌ها' },
  'مدیر سیستم': { id: 2, description: 'مدیریت کاربران و نقش‌ها' },
  'کارشناس': { id: 3, description: 'دسترسی به محتوا و گزارشات' },
  'کارشناس ارشد': { id: 3, description: 'دسترسی به محتوا و گزارشات' },
  'حسابرس': { id: 4, description: 'دسترسی به گزارشات مالی' },
  'مهمان': { id: 5, description: 'دسترسی محدود' },
  'کاربر': { id: 6, description: 'دسترسی پایه به سیستم' },
  
  // ===== نگارش‌های مختلف =====
  'ادمین سیستم': { id: 1, description: 'دسترسی کامل به تمام بخش‌های سیستم' },
  'مدیر ارشد': { id: 2, description: 'مدیریت کاربران و نقش‌ها' },
};

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
  roles: { roleId: number; roleName: string; description: string }[] = [];
  selectedRoleId: number | null = null;
  loading = false;
  fullName = '';
  userData: LoginResponse | null = null;

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
    
    this.fullName = this.userData?.fullName || '';
    
    const roleNames = this.userData?.roles || [];
    
  
    this.roles = roleNames.map(name => {
      const trimmedName = name.trim();
      const roleInfo = ROLE_MAP[trimmedName];
      

      

      if (!roleInfo) {

        return {
          roleId: 999,
          roleName: trimmedName,
          description: 'نقش کاربری'
        };
      }
      
      return {
        roleId: roleInfo.id,
        roleName: trimmedName,
        description: roleInfo.description
      };
    }).filter(role => role.roleId !== 0);


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
      const response = await lastValueFrom(this.api.selectRole({
        userId: this.authService.getUserId()!,
        roleId: this.selectedRoleId
      }));
  
  
      this.authService.setSelectedRole(response);
  
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 0);
  
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'خطا',
        detail: error?.error?.message || 'خطا در انتخاب نقش'
      });
    } finally {
      this.loading = false;
    }
  }
  
  
}