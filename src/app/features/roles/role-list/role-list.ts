import { Component, inject, OnInit } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { roleDto } from '../../../core/models/roleDto';
import { RolePage } from '../role-page/role-page';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiService } from '../../../core/services/api-service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import Swal from 'sweetalert2';
import { PermissionsPage } from '../permissions-page/permissions-page';

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputIconModule,
    TableModule,
    TagModule,
    ToastModule,
    CommonModule,
    InputTextModule,
    MessageModule,
    ReactiveFormsModule,
    ChipModule
  ],
  templateUrl: './role-list.html',
  styleUrl: './role-list.scss',
})
export class RoleList implements OnInit {
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private userService = inject(ApiService);
  private confirmationService = inject(ConfirmationService);
  roles: roleDto[] = [];
  filteredRoles: roleDto[] = [];
  selectedRoles: roleDto[] = [];
    loading = false;
  searchValue = '';
  statusLoading: { [key: number]: boolean } = {};
    currentPage = 1;
  rowsPerPage = 10;
  totalRecords = 0;

  constructor() {}

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.loading = true;
    this.userService.GetAllRoles().subscribe({
      next: (res: roleDto[]) => {
        this.roles = res.map(role => ({
          ...role,
          permissions: role.permissions || []
        }));
        this.filteredRoles = [...this.roles];
        this.totalRecords = this.filteredRoles.length;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطا',
          detail: 'بارگذاری نقش‌ها با مشکل مواجه شد',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;
    
    if (!value.trim()) {
      this.filteredRoles = [...this.roles];
    } else {
      const searchTerm = value.toLowerCase().trim();
      this.filteredRoles = this.roles.filter(role =>
        role.roleName?.toLowerCase().includes(searchTerm) ||
        role.description?.toLowerCase().includes(searchTerm) 
      //  role.permissions?.some(p => p.toLowerCase().includes(searchTerm))
      );
    }
    this.totalRecords = this.filteredRoles.length;
    this.currentPage = 1;
  }

  getPaginatedRoles(): roleDto[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredRoles.slice(start, end);
  }

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
  }

  toggleRoleStatus(role: roleDto) {
    const newStatus = !role.isActive;
    const action = newStatus ? 'فعال' : 'غیرفعال';
    
    Swal.fire({
      title: `${action} کردن نقش`,
      text: `آیا از ${action} کردن "${role.roleName}" مطمئن هستید؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'انصراف'
    }).then((result) => {
      if (result.isConfirmed) {
        this.statusLoading[role.roleId] = true;
        
        this.userService.ToggleRoleStatus(role).subscribe({
          next: () => {
            role.isActive = newStatus;
            this.showSuccess(`نقش با موفقیت ${action} شد`);
            this.statusLoading[role.roleId] = false;
          },
          error: (err) => {
            this.showError('تغییر وضعیت انجام نشد');
            this.statusLoading[role.roleId] = false;
            console.error(err);
          }
        });
      }
    });
  }

  openNew() {
    const ref = this.dialogService.open(RolePage, {
      header: 'ایجاد نقش جدید',
      width: '80%',
      closable: true,  
      closeOnEscape: true, 
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { mode: 'create' }
    });

    ref?.onClose.subscribe((result) => {
      if (result) {
        this.loadRoles();
        this.showSuccess('نقش با موفقیت ایجاد شد');
      }
    });
  }

  editRole(role: roleDto) {
    const ref = this.dialogService.open(RolePage, {
      header: 'ویرایش نقش',
      width: '80%',
      closable: true,  
      closeOnEscape: true, 
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { 
        mode: 'edit', 
        roleId: role.roleId 
      }
    });
    
    ref?.onClose.subscribe((result) => {
      if (result) {
        this.loadRoles();  
        this.showSuccess('نقش با موفقیت ویرایش شد');
      }
    });
  }

  assignPermissions(role: roleDto) {
    const ref = this.dialogService.open(PermissionsPage, {
      header: 'تخصیص دسترسی به نقش',
      width: '80%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { 
        roleId: role.roleId,
        roleName: role.roleName
      }
    });
    
    ref?.onClose.subscribe((result) => {
      if (result) {
        this.loadRoles();  
        this.showSuccess('دسترسی‌ها با موفقیت تخصیص داده شدند');
      }
    });
  }


  refresh() {
    this.loadRoles();
    this.searchValue = '';
    this.selectedRoles = [];
    this.currentPage = 1;
  }

  clearSearch(table: Table) {
    this.searchValue = '';
    this.filteredRoles = [...this.roles];
    this.totalRecords = this.filteredRoles.length;
    table.filterGlobal('', 'contains');
  }

  showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'موفق', detail: msg, life: 3000 });
  }

  showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'خطا', detail: msg, life: 3000 });
  }
}