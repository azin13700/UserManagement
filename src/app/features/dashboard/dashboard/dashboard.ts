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
import { MessageService, ConfirmationService, TreeNode } from 'primeng/api';
import { ApiService } from '../../../core/services/api-service';
import { AuthService } from '../../../core/services/auth-service';
import { async, lastValueFrom } from 'rxjs';
import { RequestWorkFlowDto } from '../../../core/models/RequestWorkFlowDto';
import { SelectModule } from 'primeng/select';
import { SubjectDto } from '../../../core/models/SubjectDto';
import { UnitDto } from '../../../core/models/UnitDto';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';
import { TreeSelectModule } from 'primeng/treeselect';
import { DialogService } from 'primeng/dynamicdialog';
import { Answer } from '../answer/answer';
import { RequestHistory } from '../request-history/request-history';

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
    ConfirmDialogModule,
    SelectModule,
        MessageDialogComponent,
        ConfirmDialogComponent,
        TreeSelectModule,

  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit {

globalSearch: any;

  private api = inject(ApiService);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  requests: RequestWorkFlowDto[] = [];
  filteredRequests: RequestWorkFlowDto[] = [];
  selectedCategory: string | null = null;
  selectedRequests: RequestWorkFlowDto[] = [];
  loading = false;
  searchValue = '';
   userUnit:UnitDto[]=[];
   currentPage = 1;
   rowsPerPage = 10;
   totalRecords = 0;
   requestCode = '';

   selectedSubjectId: number | null = null;
   selectedSubSubjectId: number | null = null;
   selectedUnitId: number | null = null;
   dialogVisible = false;
   isEditMode = false;
roleId:any;
 
   subjects: SubjectDto[] = [];
   filteredSubSubjects: SubjectDto[] = [];
   units: Unit[] = [];
 
   unitNodes: TreeNode[] = [];
    userFullName = '';
    userRole = '';
    userUnitName = '';
    userUnitId: number | null = null;


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
    this.LoadSubjects();
    this.loadUits();
  }

  loadUserInfo() {
    const userData = this.authService.getUserData();
    this.userFullName = userData?.fullName || 'کاربر';
    this.userRole = this.authService.getSelectedRoleName() || '';
    const selectedRole = this.authService.getSelectedRole();
    this.userUnitName = selectedRole?.unitName || 'واحد نامشخص';
    this.userUnitId = selectedRole?.unitId ;
    this.roleId = selectedRole?.roleId;
  }
  userId:any;

  selectedUnitKey: string | null = null;
 loadRequests(): void {

  this.loading = true;
  this.userId = this.authService.getUserId();

  this.api.getWorkflowRequests(this.roleId,this.userUnitId).subscribe({

    next: (res) => {

      this.requests = res;
      this.filteredRequests = res;
      this.totalRecords = res.length;

      this.loading = false;
    },

    error: (err) => {
      console.log(err);
      this.loading = false;
    }

  });

}

  applyFilters() {
    let result = [...this.requests];

    if (this.selectedStatus) {
   //   result = result.filter(r => r.status === this.selectedStatus);
    }

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

  
  async LoadSubjects(){
    try {
      const res = await lastValueFrom(this.api.GetAllSubject());
      this.subjects = res.map(r => ({ 
        subjectId: r.subjectId || r.subjectId, 
        title: r.title ,
        parentId: r.parentId ,
 
        isActive:true
      }));
    } catch (error) {
    this.showError('بارگذاری موضوع ها با مشکل مواجه شد');
    }
  }

  async loadUits(){
    try {
      const res = await lastValueFrom(this.api.GetAllUnits());
      this.unitNodes = this.buildTree(res);
    } catch (error) {
     this.showError('بارگذاری نقش‌ها با مشکل مواجه شد');
    }
  }

  private buildTree(units: UnitDto[]): TreeNode[] {

    const map = new Map<number, TreeNode>();
  
    units.forEach(u => {
  
        map.set(u.unitId, {
  
            key: u.unitId.toString(),
  
            label: u.name,
  
            data: u,
  
            children: []
  
        });
  
    });
  
    const roots: TreeNode[] = [];
  
    units.forEach(u => {
  
        const node = map.get(u.unitId)!;
  
        if (u.parentId && map.has(u.parentId)) {
  
            map.get(u.parentId)!.children!.push(node);
  
        } else {
  
            roots.push(node);
  
        }
  
    });
  
    return roots;
  
  }




  onSubjectChange(event: any) {
    const subjectId = event.value;
   // this.userForm.patchValue({ subjectId: subjectId });
    
    if (subjectId) {
  
    this.api.GetSubSubjects(subjectId).subscribe({
      next: (res) => {
        this.filteredSubSubjects = res.map(r => ({ 
          subjectId: r.subjectId || r.subjectId, 
          title: r.title ,
          parentId: r.parentId ,
          isActive:true
        }));
      },
      error: (err) => {
        this.loading = false;
        let errorMsg = 'خطا در انجام عملیات';
      }
    });
    } else {
      this.filteredSubSubjects = [];
    }
  }
  onUnitChange(event: any) {
    const unitId = event.value;
   // this.userForm.patchValue({ unitId: unitId });
    }

    onSubSubjectChange(event:any){
      const subSubjectId = event.value;
    //  this.userForm.patchValue({ subSubjectId: subSubjectId });
    }

    onUnitSelect(event: any) {
      this.selectedUnitId = event.node.data.unitId;
    }


    onSearch() {

      const dto = {
        roleId: this.roleId,
        userUnitId: this.userUnitId,
      
        unitId: this.selectedUnitId ? [this.selectedUnitId] : [],
        subjectId: this.selectedSubjectId ? [this.selectedSubjectId] : [],
        subSubjectId: this.selectedSubSubjectId ? [this.selectedSubSubjectId] : [],
        requestCode: this.requestCode
      };
    
      this.api.SearchRequest(dto).subscribe({
        next: (res) => {
    
          this.requests = res;
          this.filteredRequests = res;
          this.totalRecords = res.length;
    
        }
      });
    
    }

    onAnswer(request:any) {
   
      const ref = this.dialogService.open(Answer, {
        header: 'ثبت پاسخ',
        width: '700px',
        modal: true,
        closable: true,
        maximizable: false,
        draggable: false,
        resizable: false,
        contentStyle: {
            overflow: 'auto'
        },
        data: {
            mode: 'edit',
            requestId: request.id,
            unitId :request.unitId,
            userId: this.userId
        }
    });
    ref?.onClose.subscribe(result => {
      if (result)
        this.showSuccess(`پاسخ با موفقیت ایجاد شد`);
       this.loadRequests();
    });

   }


    onRequestHistory(request:any){
      const ref = this.dialogService.open(RequestHistory, {
        header: 'گردش درخواست',
        width: '1400px',
        modal: true,
        closable: true,
        maximizable: false,
        draggable: false,
        resizable: false,
        contentStyle: {
            overflow: 'auto'
        },
        data: {
            mode: 'edit',
            requestId: request.id,
      
        }
    });
    ref?.onClose.subscribe(result => {
      if (result)
       // this.showSuccess(`پاسخ با موفقیت ایجاد شد`);
       this.loadRequests();
    });
      }

  viewDetails(request: RequestWorkFlowDto) {
    this.selectedRequest = request;
    this.detailDialogVisible = true;
  }


  clearAllFilters() {

    this.requestCode = '';
  
    this.selectedSubjectId = null;
    this.selectedSubSubjectId = null;
    this.selectedUnitId = null;
  
    this.filteredSubSubjects = [];
  
    this.loadRequests();
  }







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

  refresh() {
    this.loadRequests();
    this.searchValue = '';
    this.selectedStatus = '';
  }

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