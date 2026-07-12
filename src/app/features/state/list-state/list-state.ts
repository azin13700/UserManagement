import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';
import { lastValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api-service';
import { StatusDto } from '../../../core/models/StatusDto';

@Component({
  selector: 'app-list-state',
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
  templateUrl: './list-state.html',
  styleUrl: './list-state.scss',
})
export class ListState implements OnInit{
  private api = inject(ApiService);

  permissions: StatusDto[] = [];
  loading = false;
  
  
  dialogVisible = false;
  isEditMode = false;
  currentPermission: StatusDto = {
    stateId: 0,
    stateName: '',
    isAssigned:true,
    isEnable:true,
    stateCaption:'',
    unitId:0,
    userId:0,
    isActive: true,
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
      this.permissions = await lastValueFrom(this.api.GetAllStatus());

    } catch (error) {
      this.showError('خطا در بارگذاری وضعیت ها');
    } finally {
      this.loading = false;
    }
  }


  openNew() {
    this.isEditMode = false;
    this.currentPermission = {
      stateId: 0,
      stateName: '',
      isAssigned:true,
      isEnable:true,
      stateCaption:'',
      unitId:0,
      userId:0,
      isActive: true,
    };
    this.dialogVisible = true;
  }

  editPermission(permission: StatusDto) {

    this.isEditMode = true;
    this.currentPermission = { ...permission };
    this.dialogVisible = true;
  }

async savePermission() {
  // if (!this.currentPermission.stateName.trim()) {
  //   this.showError('نام دسترسی الزامی است');
  //   return;
  // }
  // if (!this.currentPermission.category.trim()) {
  //   this.showError('دسته‌بندی الزامی است');
  //   return;
  // }

  this.loading = true;
  try {
    const formData = new FormData();
      formData.append('stateId', String(this.currentPermission.stateId));
      formData.append('stateName', this.currentPermission.stateName || '');
      formData.append('stateCaption', this.currentPermission.stateCaption || '');
      formData.append('isEnable', String(this.currentPermission.isEnable ?? true));
      formData.append('isActive', String(this.currentPermission.isActive ?? true));
      formData.append('isAssigned', String(this.currentPermission.isAssigned ?? true));
const id = this.currentPermission.stateId;
    if (this.isEditMode) {
      await lastValueFrom(this.api.UpdateState(id,formData));
      this.showSuccess('وضعیت با موفقیت ویرایش شد');
    } else {
      await lastValueFrom(this.api.createStatus(   formData));
      this.showSuccess('وضعیت با موفقیت ایجاد شد');
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
