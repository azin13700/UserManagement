import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';

import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ApiService } from '../../../core/services/api-service';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';

interface Role {
  id: number;
  name: string;
  description: string;
}

interface Permission {
  id: number;
  name: string;
  category: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  roleCount: number;
}

@Component({
  selector: 'app-role-permission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TagModule,
    ToastModule,
    SelectModule,
    ConfirmDialogModule,
    MessageDialogComponent,
     ConfirmDialogComponent
  ],
  providers: [MessageService],
  templateUrl: './role-permission.html',
  styleUrls: ['./role-permission.scss']
})
export class RolePermission implements OnInit { 
  private api = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  permissions: Permission[] = [];
  loading = false;
  
  // دیالوگ
  dialogVisible = false;
  isEditMode = false;
  currentPermission: Permission = {
    id: 0,
    name: '',
    category: '',
    description: '',
    isActive: true,
    createdAt: '',
    roleCount: 0
  };

  searchValue = '';
  categories: string[] = [];
  selectedCategory: string | null = null;

  ngOnInit() {
    this.loadPermissions();
  }

  async loadPermissions() {
    this.loading = true;
    try {
      this.permissions = await lastValueFrom(this.api.getAllPermissions());
      this.extractCategories();
    } catch (error) {
      this.showError('خطا در بارگذاری دسترسی‌ها');
    } finally {
      this.loading = false;
    }
  }

  extractCategories() {
    const categorySet = new Set<string>();
    this.permissions.forEach(p => categorySet.add(p.category));
    this.categories = Array.from(categorySet);
  }

  get filteredPermissions(): Permission[] {
    let result = [...this.permissions];
    
    if (this.searchValue.trim()) {
      const term = this.searchValue.trim().toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedCategory) {
      result = result.filter(p => p.category === this.selectedCategory);
    }
    
    return result;
  }

  openNew() {
    this.isEditMode = false;
    this.currentPermission = {
      id: 0,
      name: '',
      category: '',
      description: '',
      isActive: true,
      createdAt: '',
      roleCount: 0
    };
    this.dialogVisible = true;
  }

  editPermission(permission: Permission) {
    this.isEditMode = true;
    this.currentPermission = { ...permission };
    this.dialogVisible = true;
  }

async savePermission() {
  if (!this.currentPermission.name.trim()) {
    this.showError('نام دسترسی الزامی است');
    return;
  }
  if (!this.currentPermission.category.trim()) {
    this.showError('دسته‌بندی الزامی است');
    return;
  }

  this.loading = true;
  try {
    const dataToSend = {
      id: this.currentPermission.id,
      name: this.currentPermission.name,
      category: this.currentPermission.category,
      description: this.currentPermission.description || '',
      isActive: this.currentPermission.isActive
    };


    if (this.isEditMode) {
      await lastValueFrom(this.api.updatePermission(dataToSend));
      this.showSuccess('دسترسی با موفقیت ویرایش شد');
    } else {
      await lastValueFrom(this.api.createPermission(dataToSend));
      this.showSuccess('دسترسی با موفقیت ایجاد شد');
    }
    
    this.dialogVisible = false;
    await this.loadPermissions();
    
  } catch (error: any) {
    this.showError(error?.error?.message || 'خطا در ذخیره اطلاعات');
  } finally {
    this.loading = false;
  }
}

  getStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'فعال' : 'غیرفعال';
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


}
