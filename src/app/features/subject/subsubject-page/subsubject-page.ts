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
    ConfirmDialogModule
  ],
  templateUrl: './subsubject-page.html',
  styleUrl: './subsubject-page.scss',
})
export class SubsubjectPage   implements OnInit {
confirm() {
throw new Error('Method not implemented.');
}

  
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


  showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'موفق', detail: msg, life: 3000 });
  }

  showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'خطا', detail: msg, life: 3000 });
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
    //   this.showSuccess('زیرمجموعه با موفقیت ایجاد شد');
    //   this.newChildTitle = '';
    //   this.showAddInput = false;
      
    //   this.loadSubjectData();
      
    // } catch (error: any) {
    //   console.error('❌ خطا:', error);
    //   const errorMsg = error?.error?.message || 'خطا در ایجاد زیرمجموعه';
    //   this.showError(errorMsg);
    // } finally {
    //   this.savingChild = false;



}

toggleSubjectStatus(subject: SubjectDto) {

  this.confirmationService.confirm({
    message: 'آیا از تغییر وضعیت این موضوع مطمئن هستید؟',
    header: 'تغییر وضعیت',
    icon: 'pi pi-info-circle',

    rejectButtonProps: {
      label: 'خیر',
      severity: 'danger',
      outlined: true

    },
    acceptButtonProps: {
      label: 'بلی',
      severity: 'success',
      outlined: true
    },

    accept: () => {

      this.api.ToggleSubjectStatus(subject).subscribe({
        next: () => {
          this.loadSubjectData();
        }
      });

    }

  });

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
  

