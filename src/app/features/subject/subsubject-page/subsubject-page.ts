import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { lastValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api-service';
import { SubjectDto } from '../../../core/models/SubjectDto';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';

@Component({
  selector: 'app-subsubject-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    InputTextModule,
    TextareaModule,
    ConfirmDialogModule,
    MessageDialogComponent,
    ConfirmDialogComponent
  ],
  templateUrl: './subsubject-page.html',
  styleUrl: './subsubject-page.scss',
})
export class SubsubjectPage   implements OnInit {
  
  subjectForm!: FormGroup;
  loading = false;
  isEditMode = false;
  parentId: number | null = null;

  parentSubjects: { label: string; value: number }[] = [];
  private confirmationService=inject(ConfirmationService); 

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private api: ApiService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.isEditMode = this.config.data?.mode === 'edit';
    this.parentId = this.config.data?.subjectId || null;
  }

  ngOnInit() {  
      this.initForm();
      this.loadSubjectData();
  }

  async loadSubjectData() {
    try {
      this.childrenList = await lastValueFrom(this.api.getChildren(this.parentId!));
      
      
    } catch (error) {
      this.showError('خطا در دریافت اطلاعات موضوع');
    }
  }

 
  subjects: SubjectDto[] = [];
  childrenList: SubjectDto[] = [];
  selectedSubject: SubjectDto | null = null;

  statusLoading: { [key: number]: boolean } = {};

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

  initForm() {
    this.subjectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      parentId: [null],
      isActive:true,
      subjectId:[''] 
    });
  }
  showAddInput = false;
  newChildTitle = '';
  savingChild = false;

  toggleAddInput() {
    this.showAddInput = !this.showAddInput;
    if (!this.showAddInput) {
      this.newChildTitle = '';
    }
  }

  cancelAddChild() {
    this.showAddInput = false;
    this.newChildTitle = '';
  }


  async saveNewChild() {
    if (this.subjectForm.invalid) {
      Object.keys(this.subjectForm.controls).forEach(key => {
        const control = this.subjectForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
          console.log(     this.subjectForm.value);
        }
      });
      this.showError('لطفاً همه فیلدهای الزامی را به درستی پر کنید');
      return;
    }
    this.savingChild = true;
    

      const formData = new FormData();
      // formData.append('Title', title);
      formData.append('subjectId', this.subjectId?.toString() || '0');
      formData.append('IsActive', 'true');
          if (this.isEditMode && this.parentId) {
      formData.append('ParentId', this.parentId.toString());
    }
    formData.append('Title', this.subjectForm.get('title')?.value || '');

        
    const request = this.isEditMode && this.subjectId 
      ? this.api.updateSubject(this.subjectId, formData)
      : this.api.createSubject(formData);
  
    request.subscribe({
      next: () => {
     
        this.loading = false;
        this.ref.close(true);
      },
      error: (err) => {
        this.loading = false;
        let errorMsg = 'خطا در انجام عملیات';
        if (err.error?.errors) {
          errorMsg = Object.values(err.error.errors).flat().join(', ');
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        }
        this.showError(errorMsg);
      }
    });



}

toggleSubjectStatus(subject: SubjectDto) {


  const newStatus = !subject.isActive;
  const action = newStatus ? 'فعال' : 'غیرفعال';
  
  this.showConfirm(
    'تغییر وضعیت',
    `آیا از ${action} کردن واحد "${subject.title}" مطمئن هستید؟`,
    async () => {
      this.statusLoading[subject.subjectId] = true;
      try {
        await lastValueFrom(this.api.ToggleSubjectStatus(subject));
        subject.isActive = newStatus;
        this.showSuccess(`موضوع با موفقیت ${action} شد`);
      } catch (error) {
        this.showError('خطا در تغییر وضعیت');
      } finally {
        this.statusLoading[subject.subjectId] = false;
      }
    },
    newStatus ? 'success' : 'danger'
  );

}
  subjectId!:number;

  async editSubject(sub: SubjectDto) {
    this.showAddInput = !this.showAddInput;
    this.isEditMode = true;
    this.subjectId = sub.subjectId;
    const data = await lastValueFrom(this.api.getSubjectById(sub.subjectId));
    console.log(data);
    this.subjectForm.patchValue({
      title: data.title,
      parentId: data.parentId || null,
      isActive: data.isActive,
      subjectId:data.subjectId
     });
     console.log(     this.subjectForm.value);
   } 

}
  

