import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../../core/services/api-service';
import { SubjectDto } from '../../../core/models/SubjectDto';
import { SubjectPage } from '../subject-page/subject-page';
import { SubsubjectPage } from '../subsubject-page/subsubject-page';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-list-subject',
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
    ChipModule,
    MessageDialogComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './list-subject.html',
  styleUrl: './list-subject.scss',
})
export class ListSubject implements OnInit  {



  private dialogService = inject(DialogService);
  private userService = inject(ApiService);


    roles: SubjectDto[] = [];
    filteredRoles: SubjectDto[] = [];
    selectedSubjects: SubjectDto[] = [];
      loading = false;
    searchValue = '';
    statusLoading: { [key: number]: boolean } = {};
      currentPage = 1;
    rowsPerPage = 10;
    totalRecords = 0;
    childrenDialogVisible = false;
    selectedSubject: SubjectDto | null = null;
    childrenList: SubjectDto[] = [];
    columns = [
      { field: 'title', header: ' عنوان موضوع' },
      { field: 'userCount', header: 'تخصیص زیرموضوعات ' },
      { field: 'isActive', header: 'وضعیت' },
      { field: 'edit', header: 'ویرایش' },
    
    ];
  


  ngOnInit(): void {
    this.loadSubject();
  }
  loadSubject() {
      this.loading = true;
      this.userService.GetAllSubject().subscribe({
        next: (res: SubjectDto[]) => {
          this.roles = res.map(role => ({
            ...role,
           // permissions: role.permissions || []
          }));
          this.filteredRoles = [...this.roles];
          this.totalRecords = this.filteredRoles.length;
          this.loading = false;
        },
        error: (err) => {
          this.showError('بارگذاری موضوع ها با مشکل مواجه شد');
     
          this.loading = false;
        }
      });
    }

    getPaginatedSubjects(): SubjectDto[] {
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        return this.filteredRoles.slice(start, end);
      }

        openNew() {
          const ref = this.dialogService.open(SubjectPage, {
            header: 'ایجاد موضوع جدید',
            width: '50%',
            closeOnEscape: true, 
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            data: { mode: 'create' }
          });
      
          ref?.onClose.subscribe((result) => {
            if (result) {
              this.loadSubject();
              this.showSuccess('موضوع با موفقیت ایجاد شد');
            }
          });
        }


   editSubject(role: SubjectDto) {
          const ref = this.dialogService.open(SubjectPage, {
            header: 'ویرایش موضوع',
            width: '50%',
            closeOnEscape: true, 
            contentStyle: { overflow: 'auto' },
            baseZIndex: 10000,
            data: { 
              mode: 'edit', 
              subjectId: role.subjectId 
            }
          });
          
          ref?.onClose.subscribe((result) => {
            if (result) {
              this.loadSubject();  
              this.showSuccess('موضوع با موفقیت ویرایش شد');
            }
          });
        }


   showChildren(subject: SubjectDto) {
    const ref = this.dialogService.open(SubsubjectPage, {
      header: 'نمایش لیست زیر موضوعات',
      width: '80%',
      closable: true,  
      closeOnEscape: true, 
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { 
        mode: 'edit', 
        subjectId: subject.subjectId 
      }
    });
    
    ref?.onClose.subscribe((result) => {
      if (result) {
        this.loadSubject();  
        this.showSuccess('موضوع با موفقیت ویرایش شد');
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
   refresh(){

    }

   onPageChange(event: any) {
     this.currentPage = event.first / event.rows + 1;
     this.rowsPerPage = event.rows;
  }

  onSearch(event: Event) {
          const value = (event.target as HTMLInputElement).value;
          this.searchValue = value;
          
          if (!value.trim()) {
            this.filteredRoles = [...this.roles];
          } else {
            const searchTerm = value.toLowerCase().trim();
         //   this.filteredRoles = this.roles.filter(role =>
           //   role.roleName?.toLowerCase().includes(searchTerm) ||
            //  role.description?.toLowerCase().includes(searchTerm) 
            //  role.permissions?.some(p => p.toLowerCase().includes(searchTerm))
           // );
          }
          this.totalRecords = this.filteredRoles.length;
          this.currentPage = 1;
    }
 
    toggleSubjectStatus(subject:any) {
         const newStatus = !subject.isActive;
          const action = newStatus ? 'فعال' : 'غیرفعال';
          
          this.showConfirm(
            'تغییر وضعیت',
            `آیا از ${action} کردن موضوع "${subject.title}" مطمئن هستید؟`,
            async () => {
              //this.statusLoading[subject.] = true;
              try {
                await lastValueFrom(this.userService.ToggleSubjectStatus(subject));
                subject.isActive = newStatus;
                this.showSuccess(`موضوع با موفقیت ${action} شد`);
              } catch (error) {
                this.showError('خطا در تغییر وضعیت');
              } finally {
               // this.statusLoading[subject.unitId] = false;
              }
            },
            newStatus ? 'success' : 'danger'
          );
  
    }
}
