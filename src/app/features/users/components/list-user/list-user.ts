import { Component, OnInit, ViewEncapsulation, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { lastValueFrom } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ApiService } from '../../../../core/services/api-service';
import { UserForm } from '../user-form/user-form';
import Swal from 'sweetalert2';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../../shared/message-dialog-component/message-dialog-component';
import { ShamsiDatePipe } from '../../../../shared/pipes/shamsi-date-pipe';

interface User {
  userId: number;
  fullName: string;
  photo: string | null;
  role: string[];
  userName: string;
  email: string;
  status: string;
  unit:string[]
  createdAt: string;
  isActive?:boolean;
}

@Component({
  selector: 'app-list-user',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    TableModule,
    TagModule,
    ToastModule,
    InputTextModule,
    SelectModule,
    MultiSelectModule,
    TooltipModule,
    MessageDialogComponent,
    ConfirmDialogComponent,
    ShamsiDatePipe 
  ],
  providers: [MessageService, ConfirmationService, DialogService],
  templateUrl: './list-user.html',
  styleUrls: ['./list-user.scss']
})
export class ListUser implements OnInit {
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private userService = inject(ApiService);
  private confirmationService = inject(ConfirmationService);

  allUsers: User[] = [];
  filteredUsersList: User[] = [];
  selectedUsers: User[] = [];
  loading = false;
  searchLoading = false;
  globalSearch = '';
  selectedRoles: string[] = [];
  selectedStatus: any = null;
  currentPage = 1;
  rowsPerPage = 10;
  roleOptions: any[] = [];
  statusOptions = [
    { label: 'فعال', value: 'Active' },
    { label: 'غیرفعال', value: 'Inactive' }
  ];
  
  statusLoading: { [key: number]: boolean } = {};
  visible: boolean = false;
  
  get isFilterActive(): boolean {
    return !!(this.globalSearch || this.selectedRoles.length > 0 || this.selectedStatus);
  }

  get filteredUsers(): User[] {
    return this.filteredUsersList;
  }

  get totalRecords(): number {
    return this.filteredUsersList.length;
  }

  get paginatedUsers(): User[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    return this.filteredUsersList.slice(start, start + this.rowsPerPage);
  }


  
  ngOnInit() {
    this.loadUsers();

  }


  
  loadUsers() {
    this.loading = true;
    this.userService.GetAllUsers().subscribe({
      next: (res: User[]) => {
        this.allUsers = res.map(user => ({
          ...user,
          fullName: user.fullName,
          photo:         user.photo ? `data:image/jpeg;base64,${user.photo}` : null,
          role: user.role || []
  
        }));
        this.filteredUsersList = [...this.allUsers];
        this.extractRoleOptions();
        this.loading = false;
      },
      error: () => {
        this.showError('بارگذاری کاربران با مشکل مواجه شد');
        this.loading = false;
      }
    });
  }

  extractRoleOptions() {
    const rolesSet = new Set<string>();
    this.allUsers.forEach(user => {
      user.role?.forEach(role => rolesSet.add(role));
    });
    this.roleOptions = Array.from(rolesSet).map(role => ({
      label: this.getRoleLabel(role),
      value: role
    }));
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      'Admin': 'مدیر',
      'Manager': 'مدیر سیستم',
      'Expert': 'کارشناس',
      'Auditor': 'حسابرس',
      'Guest': 'مهمان'
    };
    return map[role] || role;
  }

  generateAvatar(fullName: string): string {
    const initials = fullName.split(' ').map(n => n[0]).join('');
    return `https://ui-avatars.com/api/?background=3b82f6&color=fff&rounded=true&size=38&name=${encodeURIComponent(initials)}`;
  }

onSearch() {
  if (!this.globalSearch.trim()) {
    this.filteredUsersList = [...this.allUsers];
    this.applyLocalFilters();
    return;
  }

  this.searchLoading = true;

  const searchDto = {
    fullName: this.globalSearch,  
    userName: this.globalSearch,  
    email: this.globalSearch,     
    isActive: null,
    role: [],
    unit: []
  };

  this.userService.SearchEmployee(searchDto).subscribe({
    next: (res: User[]) => {
      this.filteredUsersList = res.map(user => ({
        ...user,
        fullName: user.fullName,
        role: user.role || [],
        isActive: user.isActive,
        unit: user.unit || []
      }));
      this.applyLocalFilters();
      this.searchLoading = false;
      this.currentPage = 1;
    },
    error: (err) => {
      this.showError('خطا در جستجو');
      this.searchLoading = false;
    }
  });
}
  
  applyLocalFilters() {
    let result = [...this.filteredUsersList];
    
    if (this.selectedRoles.length > 0) {
      result = result.filter(user =>
        user.role?.some(r => this.selectedRoles.includes(r))
      );
    }
    
    if (this.selectedStatus !== null) {
      result = result.filter(user => user.isActive === this.selectedStatus);
    }
    
    this.filteredUsersList = result;
    this.currentPage = 1;
  }
  
  onFilterChange() {
    this.applyLocalFilters();
  }
  
  clearAllFilters() {
    this.globalSearch = '';
    this.selectedRoles = [];
    this.selectedStatus = null;
    this.filteredUsersList = [...this.allUsers];
    this.currentPage = 1;
  }



  
  onPageChange(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
  }

  
  openNew() {
    const ref = this.dialogService.open(UserForm, {
      header: 'ایجاد کاربر جدید',
      width: '80%',
      height:'96%',
      contentStyle: { overflow: 'auto' },
      data: { mode: 'create' }
    });
    ref?.onClose.subscribe((result) => {
      if (result) {
        this.loadUsers();
        this.showSuccess(`کاربر با موفقیت ایجاد شد`);
       
      }
    });
  }

  editUser(user: User) {
    const ref = this.dialogService.open(UserForm, {
      header: 'ویرایش کاربر',
      closable: true,  
      closeOnEscape: true, 
      width: '80%',
      height:'96%',
      contentStyle: { overflow: 'auto' },
      data: { mode: 'edit', userId: user.userId }
    });
    ref?.onClose.subscribe((result) => {
      if (result) {
        this.loadUsers();
        this.showSuccess(`کاربر با موفقیت ویرایش شد`);
      }
    });
  }

  toggleUserStatus(user: User) {
    const newStatus = !user.isActive;
    const action = newStatus ? 'فعال' : 'غیرفعال';
    this.showConfirm(
      'تغییر وضعیت',
      `آیا از ${action} کردن واحد "${user.fullName}" مطمئن هستید؟`,
      async () => {
        this.statusLoading[user.userId] = true;
        try {
          await lastValueFrom(this.userService.ToggleUnitStatus(user.userId));
          user.isActive = newStatus;
          this.showSuccess(`واحد با موفقیت ${action} شد`);
        } catch (error) {
          this.showError('خطا در تغییر وضعیت');
        } finally {
          this.statusLoading[user.userId] = false;
        }
      },
      newStatus ? 'success' : 'danger'
    );
    


  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `آیا از حذف کاربر "${user.fullName}" اطمینان دارید؟`,
      header: 'تأیید حذف',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userService.DeleteUser(user.userId).subscribe({
          next: () => {
            this.loadUsers();
            this.showSuccess('کاربر با موفقیت حذف شد');
          },
          error: () => this.showError('خطا در حذف کاربر')
        });
      }
    });
  }



  refresh() {
    this.loadUsers();
    this.clearAllFilters();
    this.selectedUsers = [];
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