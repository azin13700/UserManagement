import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ApiService } from '../../../core/services/api-service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { PermissionDto, Permissions } from '../../../core/models/PermissionDto';
import { DividerModule } from 'primeng/divider';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';

@Component({
  selector: 'app-permissions-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, 
    ButtonModule,
    CheckboxModule,
    ToastModule,
    DialogModule,
    DividerModule,
       MessageDialogComponent,
  
  ],
  templateUrl: './permissions-page.html',
  styleUrl: './permissions-page.scss',
})
export class PermissionsPage implements OnInit {
  private api = inject(ApiService);


  permissionGroups: PermissionDto[] = [];
  allPermissions: Permissions[] = [];
  roleId!: number;
  roleName: string = '';
  loading = false;
  saving = false;
  
  selectAll: boolean = false;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.roleId = this.config.data?.roleId || 0;
    this.roleName = this.config.data?.roleName || 'نقش';
  }

  ngOnInit() {
    if (this.roleId) {
      this.loadPermissions();
    }
  }

  loadPermissions() {
    this.loading = true;
    this.api.getRolePermissions(this.roleId).subscribe({
      next: (res: PermissionDto[]) => {
        this.permissionGroups = res;
        this.allPermissions = [];
        this.permissionGroups.forEach(group => {
          group.permissions.forEach(perm => {
            this.allPermissions.push(perm);
          });
        });
    
        this.updateSelectAllState();
        this.loading = false;
      },
      error: (err) => {
        this.showError('خطا در بارگذاری دسترسی‌ها');
        this.loading = false;
        console.error(err);
      }
    });
  }


  updateSelectAllState() {
    this.selectAll = this.allPermissions.length > 0 && 
                     this.allPermissions.every(p => p.isActive);
  }


  toggleAllPermissions(event: any) {
    const checked = event.checked;
    this.allPermissions.forEach(p => p.isActive = checked);
    this.selectAll = checked;
  }


  get isAllSelected(): boolean {
    return this.allPermissions.length > 0 && 
           this.allPermissions.every(p => p.isActive);
  }


  get selectedCount(): number {
    return this.allPermissions.filter(p => p.isActive).length;
  }


  savePermissions() {
    this.saving = true;
    
    const selectedIds = this.allPermissions
      .filter(p => p.isActive)
      .map(p => Number(p.id));

    this.api.AssignPermissionsToRole(this.roleId, selectedIds).subscribe({
      next: () => {
        this.showSuccess('دسترسی‌ها با موفقیت تخصیص داده شدند');
        this.saving = false;
        this.ref.close(true);
      },
      error: (err) => {
        this.showError('خطا در ذخیره دسترسی‌ها');
        this.saving = false;
        console.error(err);
      }
    });
  }



  messageDialogVisible = false;
  messageDialogTitle = '';
  messageDialogMessage = '';
  messageDialogType: 'success' | 'error' | 'warning' | 'info' = 'info';
  messageDialogLoading = false;


  confirmDialogVisible = false;
  confirmDialogTitle = '';
  confirmDialogMessage = '';
  confirmDialogLoading = false;
  confirmDialogSeverity: 'success' | 'danger' | 'primary' = 'primary';
  confirmCallback: (() => void) | null = null;


  showSuccess(message: string, callback?: () => void) {
    this.messageDialogTitle = 'موفق';
    this.messageDialogMessage = message;
    this.messageDialogType = 'success';
    this.messageDialogVisible = true;
    this.messageDialogLoading = false;
   
    if (callback) {
   
    }
  }


  showError(message: string) {
    this.messageDialogTitle = 'خطا';
    this.messageDialogMessage = message;
    this.messageDialogType = 'error';
    this.messageDialogVisible = true;
  }


  showConfirm(
    title: string,
    message: string,
    onConfirm: () => void,
    severity: 'success' | 'danger' | 'primary' = 'primary'
  ) {
    this.confirmDialogTitle = title;
    this.confirmDialogMessage = message;
    this.confirmDialogSeverity = severity;
    this.confirmDialogVisible = true;
    this.confirmCallback = onConfirm;
  }


  handleConfirm() {
    this.confirmDialogLoading = true;
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.confirmDialogLoading = false;
    this.confirmDialogVisible = false;
  }


  handleMessageConfirm() {
    this.messageDialogVisible = false;
    
  }


  close() {
    this.ref.close();
  }
}