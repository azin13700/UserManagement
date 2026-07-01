// core/components/main-layout/main-layout.ts
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { PanelMenuModule } from 'primeng/panelmenu';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../services/auth-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PanelMenuModule,
    ButtonModule,
    AvatarModule,
    DrawerModule,
    RippleModule
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit {
  visible = false;
  selectedRoleName = '';
  private authService = inject(AuthService);
  private router = inject(Router);
  private subscription?: Subscription;
  private cd =inject(ChangeDetectorRef)

  items: MenuItem[] = [];

  ngOnInit() {
    this.loadMenu();
  
    this.subscription = this.authService.role$.subscribe(() => {
      this.loadMenu();
    });
  }

  loadMenu() {

    const selectedRole = this.authService.getSelectedRole();
    this.selectedRoleName = selectedRole?.roleName || '';
    this.buildMenu();
  }

  toggleDrawer() {

    this.visible = !this.visible;
    this.cd.detectChanges();
  
  }

  closeDrawer() {
    this.visible = !this.visible;
    this.cd.detectChanges();

  }

  buildMenu() {
    const permissions = this.authService.getUserPermissions();
 
  
    const userManagementItems: MenuItem[] = [];
  
    if (permissions.includes('User.View')) {
      userManagementItems.push({
        label: 'لیست کاربران',
        icon: 'pi pi-users',
        routerLink: '/dashboard/list-user'
      });
    }
  
    if (permissions.includes('Role.View')) {
      userManagementItems.push({
        label: 'لیست نقش‌ها',
        icon: 'pi pi-shield',
        routerLink: '/dashboard/list-role'
      });
      if (permissions.includes('permission.View')) {
        userManagementItems.push({
          label: 'دسترسی‌های نقش',
          icon: 'pi pi-key',
          routerLink: '/dashboard/role-permission'
        });
      } }
  
    if (permissions.includes('workflow.View')) {
      userManagementItems.push({
        label: ' کارتابل من',
        icon: 'pi pi-inbox',
        routerLink: '/dashboard/workflow'
      });
    }
    
    if (permissions.includes('Unit.View')) {
      userManagementItems.push({
        label: 'چارت سازمانی',
        icon: 'pi pi-building',
        routerLink: '/dashboard/list-unit'
      });
    }
    if (permissions.includes('Subject.View')) {
      userManagementItems.push({
        label: 'لیست موضوعات',
        icon: 'pi pi-sitemap',
        routerLink: '/dashboard/list-subject'
      });
    }
    if (permissions.includes('Request.View')) {
      userManagementItems.push({
        label: ' ایجاد درخواست',
        icon: 'pi pi-clipboard',
        routerLink: '/dashboard/request'
      });
    }
    
    this.items = [];
  
    if (userManagementItems.length > 0) {
      this.items.push({
        label: 'مدیریت کاربران',
        icon: 'pi pi-users',
        items: userManagementItems
      });
    } else {
      this.items.push({
        label: 'داشبورد',
        icon: 'pi pi-home',
        routerLink: '/dashboard'
      });
    }

  }
  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
  logout() {
    this.authService.logout();
  }


toggleSidebar() {
  this.visible = !this.visible;
}

closeSidebar() {
  this.visible = false;
}
}