import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../../core/services/api-service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-subject-page',
   standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    InputTextModule,
    TextareaModule
  ], 
   templateUrl: './subject-page.html',
  styleUrl: './subject-page.scss',
})
export class SubjectPage implements OnInit  { 
  
  
  subjectForm!: FormGroup;
  loading = false;
  isEditMode = false;
  subjectId: number | null = null;

  parentSubjects: { label: string; value: number }[] = [];


  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private api: ApiService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.isEditMode = this.config.data?.mode === 'edit';
    this.subjectId = this.config.data?.subjectId || null;
  }

  ngOnInit() {
    this.initForm();
    //this.loadParentSubjects();
    
    if (this.isEditMode && this.subjectId) {
      this.loadSubjectData();
    }
  }

  initForm() {
    this.subjectForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      parentId: [null],
      isActive:true,
      subjectId:[''] 
    });
  }


  async loadSubjectData() {
    try {
      const data = await lastValueFrom(this.api.getSubjectById(this.subjectId!));
      
      this.subjectForm.patchValue({
       title: data.title,
       parentId: data.parentId || null,
       isActive: data.isActive,
       subjectId:data.subjectId
      });
      console.log(     this.subjectForm.value);
      
    } catch (error) {
      this.showError('خطا در دریافت اطلاعات موضوع');
    }
  }

  onSubmit() {
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



  this.loading = true;
  const formData = new FormData();

  if (this.isEditMode && this.subjectId) {
    formData.append('SubjectId', this.subjectId.toString());
  }
  formData.append('Title', this.subjectForm.get('title')?.value || '');
  
  const parentId = this.subjectForm.get('parentId')?.value;
  if (parentId && parentId !== 0) {
    formData.append('ParentId', parentId.toString());
  }
  
  formData.append('IsActive', this.subjectForm.get('isActive')?.value ? 'true' : 'false');

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

  isInvalid(controlName: string): boolean {
    const control = this.subjectForm.get(controlName);
    return control ? (control.invalid && (control.touched || control.dirty)) : false;
  }

  showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'موفق', detail: msg, life: 3000 });
  }

  showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'خطا', detail: msg, life: 3000 });
  }

  close() {
    this.ref.close();
  }

  
}
