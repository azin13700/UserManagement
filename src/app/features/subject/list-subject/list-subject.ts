import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
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
  ],
  templateUrl: './list-subject.html',
  styleUrl: './list-subject.scss',
})
export class ListSubject implements OnInit  {
confirm() {
throw new Error('Method not implemented.');
}

  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private userService = inject(ApiService);
  private confirmationService=inject(ConfirmationService); 

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

    getPaginatedSubjects(): SubjectDto[] {
        const start = (this.currentPage - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        return this.filteredRoles.slice(start, end);
      }

        openNew() {
          const ref = this.dialogService.open(SubjectPage, {
            header: 'ایجاد موضوع جدید',
            width: '50%',
            closable: true,  
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
            closable: true,  
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

   showSuccess(msg: string) {
      this.messageService.add({ severity: 'success', summary: 'موفق', detail: msg, life: 3000 });
  }
      
  showError(msg: string) {
      this.messageService.add({ severity: 'error', summary: 'خطا', detail: msg, life: 3000 });
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
      this.confirmationService.confirm({
        target: subject.target as EventTarget,
        message: 'آیا از تایید این درخواست مطمئن هستید؟',
        header: 'تغییر وضعیت',
        icon: 'pi pi-info-circle',
        acceptButtonProps: {
          label: 'بله',
          severity: 'success' 
      },
        rejectLabel: 'خیر',
        rejectButtonProps: {
            label: 'لغو',
            severity: 'danger',
            outlined: true
        },
   
    
        accept: () => {
             this.userService.ToggleSubjectStatus(subject).subscribe({
            next: () => {
              this.loadSubject();
            },
            error: (err) => {
       
            }
          });
        },
        reject: () => {
           // this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
        }
    });


    
    }
}
