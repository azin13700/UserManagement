import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../../core/services/api-service';
import { AuthService } from '../../../core/services/auth-service';
import { lastValueFrom } from 'rxjs';
import { RequestWorkFlowDto } from '../../../core/models/RequestWorkFlowDto';

interface Request {
  id: number;
  subjectId: number;
  subjectTitle: string;
  subSubjectId: number;
  subSubjectTitle: string;
  description: string;
  unitId: number;
  unitName: string;
  photo: string | null;
  status: string;
  createdAt: string;
  createdByUserId: number;
  createdBy: string;
  canEdit: boolean;
}

interface Unit {
  unitId: number;
  name: string;
}

@Component({
  selector: 'app-workflow-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  requests: RequestWorkFlowDto[] = [];
  filteredRequests: RequestWorkFlowDto[] = [];

  selectedRequests: RequestWorkFlowDto[] = [];
  loading = false;
  searchValue = '';

  // ====== اطلاعات کاربر ======
  userFullName = '';
  userRole = '';
  userUnitName = '';
  userUnitId: number | null = null;
  // ====== صفحه‌بندی ======
  currentPage = 1;
  rowsPerPage = 10;
  totalRecords = 0;

  // ====== فیلترها ======
  statusOptions = [
    { label: 'همه', value: '' },
    { label: 'در انتظار', value: 'در انتظار' },
    { label: 'در حال بررسی', value: 'در حال بررسی' },
    { label: 'تایید شده', value: 'تایید شده' },
    { label: 'رد شده', value: 'رد شده' }
  ];
  selectedStatus: string = '';

  // ====== دیالوگ جزئیات ======
  detailDialogVisible = false;
  selectedRequest: RequestWorkFlowDto | null = null;

  // ====== آمار ======
  statistics = {
    total: 0,
    pending: 0,
    inProgress: 0,
    approved: 0,
    rejected: 0
  };

  ngOnInit() {
    this.loadUserInfo();
    this.loadRequests();
  }

  loadUserInfo() {
    const userData = this.authService.getUserData();
    this.userFullName = userData?.fullName || 'کاربر';
    this.userRole = this.authService.getSelectedRoleName() || '';
  
    // دریافت واحد کاربر از اطلاعات لاگین
    const selectedRole = this.authService.getSelectedRole();
    this.userUnitName = selectedRole?.unitName || 'واحد نامشخص';
    this.userUnitId = selectedRole?.unitId || null;
  }
  userId:any;
  loadRequests(): void {

    this.loading = true;
    this.userId = this.authService.getUserId();

    this.api.getWorkFlow(this.userId).subscribe({
  
      next: (res) => {
  
        this.requests = res;
        this.filteredRequests = res;
        this.totalRecords = res.length;
  
        this.loading = false;
  
      },
  
      error: () => {
  
        this.loading = false;
  
      }
  
    });
  
  }


  applyFilters() {
    let result = [...this.requests];

    // فیلتر وضعیت
    if (this.selectedStatus) {
   //   result = result.filter(r => r.status === this.selectedStatus);
    }

    // فیلتر جستجو
    if (this.searchValue.trim()) {
      const term = this.searchValue.toLowerCase().trim();
      result = result.filter(r =>
        r.subjectTitle.toLowerCase().includes(term) ||
        r.subSubjectTitle.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) 
       // r.createdBy.toLowerCase().includes(term)
      );
    }

    this.filteredRequests = result;
    this.totalRecords = this.filteredRequests.length;
    this.currentPage = 1;
  }

  calculateStatistics() {
    this.statistics.total = this.requests.length;
   // this.statistics.pending = this.requests.filter(r => r.status === 'در انتظار').length;
   // this.statistics.inProgress = this.requests.filter(r => r.status === 'در حال بررسی').length;
   // this.statistics.approved = this.requests.filter(r => r.status === 'تایید شده').length;
    //this.statistics.rejected = this.requests.filter(r => r.status === 'رد شده').length;
  }

  getPaginatedRequests(): RequestWorkFlowDto[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    return this.filteredRequests.slice(start, start + this.rowsPerPage);
  }

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
  }

  // ====== مشاهده جزئیات ======
  viewDetails(request: RequestWorkFlowDto) {
    this.selectedRequest = request;
    this.detailDialogVisible = true;
  }

  // ====== تغییر وضعیت ======
  changeStatus(request: Request, newStatus: string) {
    // this.confirmationService.confirm({
    //   message: `آیا از تغییر وضعیت درخواست "${request.subjectTitle}" به "${newStatus}" مطمئن هستید؟`,
    //   header: 'تأیید تغییر وضعیت',
    //   icon: 'pi pi-exclamation-triangle',
    //   accept: () => {
    //     this.api.updateRequestStatus(request.id, { status: newStatus }).subscribe({
    //       next: () => {
    //         request.status = newStatus;
    //         this.showSuccess('وضعیت درخواست با موفقیت تغییر کرد');
    //         this.calculateStatistics();
    //       },
    //       error: () => {
    //         this.showError('خطا در تغییر وضعیت');
    //       }
    //     });
    //   }
    // });
  }

  // ====== رفرش ======
  refresh() {
    this.loadRequests();
    this.searchValue = '';
    this.selectedStatus = '';
  }

  // ====== وضعیت Severity ======
  getStatusSeverity(status: string): string {
    switch (status) {
      case 'تایید شده': return 'success';
      case 'رد شده': return 'danger';
      case 'در حال بررسی': return 'warning';
      default: return 'info';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'تایید شده': return 'pi pi-check-circle';
      case 'رد شده': return 'pi pi-times-circle';
      case 'در حال بررسی': return 'pi pi-spin pi-spinner';
      default: return 'pi pi-clock';
    }
  }

  showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'موفق', detail: msg, life: 3000 });
  }

  showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'خطا', detail: msg, life: 3000 });
  }
}