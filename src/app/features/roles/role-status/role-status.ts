import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { RoleStateDto } from '../../../core/models/RoleStateDto';
import { ApiService } from '../../../core/services/api-service';

@Component({
  selector: 'app-role-status',
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
  templateUrl: './role-status.html',
  styleUrl: './role-status.scss',
})
export class RoleStatus implements OnInit {
  private api = inject(ApiService);

  allPermissions: RoleStateDto[] = [];
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
    this.api.getStatusesByRole(this.roleId).subscribe({
      next: (res: RoleStateDto[]) => {
        this.allPermissions = res || [];
        this.updateSelectAllState();
        this.loading = false;
      },
      error: (err) => {
        this.showError('خطا در بارگذاری وضعیت‌ها');
        this.loading = false;
        console.error(err);
      }
    });
  }



  get selectedCount(): number {
    return this.allPermissions.filter(p => p.isAssigned).length;
  }

  get isAllSelected(): boolean {
    return this.allPermissions.length > 0 && 
           this.allPermissions.every(p => p.isAssigned);
  }

  updateSelectAllState() {
    this.selectAll = this.isAllSelected;
  }

  toggleAllPermissions(event: any) {
    const checked = event.checked;
    this.allPermissions.forEach(p => p.isAssigned = checked);
    this.selectAll = checked;
  }

  onPermissionChange() {
    this.updateSelectAllState();
  }



  savePermissions() {
    this.saving = true;
    

    const assignedStates = this.allPermissions
      .filter(p => p.isAssigned)
      .map(p => p.stateId);

    const payload = {
      roleId: this.roleId,
      stateId: assignedStates,
      stateType:true
    };

    this.api.updateRoleStateOut( payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.ref.close(this.allPermissions);
     
      },
      error: (err) => {
        this.saving = false;
        this.showError('خطا در ذخیره وضعیت‌ها');
        console.error(err);
      }
    });
  }



  messageDialogVisible = false;
  messageDialogTitle = '';
  messageDialogMessage = '';
  messageDialogType: 'success' | 'error' | 'warning' | 'info' = 'info';
  messageDialogLoading = false;
  private messageCallback: (() => void) | null = null;

  showSuccess(message: string, callback?: () => void) {
    this.messageDialogTitle = 'موفق';
    this.messageDialogMessage = message;
    this.messageDialogType = 'success';
    this.messageDialogVisible = true;
    this.messageDialogLoading = false;
    this.messageCallback = callback || null;
  }

  showError(message: string) {
    this.messageDialogTitle = 'خطا';
    this.messageDialogMessage = message;
    this.messageDialogType = 'error';
    this.messageDialogVisible = true;
  }

  handleMessageConfirm() {
    this.messageDialogVisible = false;
    if (this.messageCallback) {
      this.messageCallback();
      this.messageCallback = null;
    }
  }

  // ============================================================
  // CLOSE
  // ============================================================

  close() {
    this.ref.close();
  }
}