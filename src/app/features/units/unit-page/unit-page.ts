import { Component, OnInit, inject } from '@angular/core';
import { TreeNode, MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api-service';
import { TextareaModule } from 'primeng/textarea';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { lastValueFrom } from 'rxjs';

interface Unit {
  id: number;
  name: string;
  description: string;
  parentUnitId?: number;
  isActive: boolean;
  userCount: number;
  createdAt: string;
  children?: Unit[];
}

@Component({
  selector: 'app-unit-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TextareaModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './unit-page.html',
  styleUrls: ['./unit-page.scss']
})
export class UnitPage implements OnInit {

  private api = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  userForm!: FormGroup;
  isEditMode = false;
  unitId: number | null = null;
  loading = false;
  statusOptions = [
    { label: 'فعال', value: true},
    { label: 'غیرفعال', value: false }
  ];
  constructor(
    private fb: FormBuilder,

    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.isEditMode = this.config.data?.mode === 'edit';
    this.unitId = this.config.data?.unitId || null;
  }

  ngOnInit() {
    this.initForm();

    
    if (this.isEditMode && this.unitId) {
      this.loadUserData();
    }
  }
  initForm() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      isActive:['Active'],
    });
  }
  async loadUserData() {
    try {
      const data = await lastValueFrom(this.api.getUnitById(this.unitId!));
      
      let birthDate = null;
    
      
      this.userForm.patchValue({
        name: data.name,
        description: data.description,
        isActive: data.isActive ,
   
      });
      
    } catch (error) {
      this.showError('خطا در دریافت اطلاعات کاربر');
    }
  }
  onSubmit() {

    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.showError('لطفاً همه فیلدهای الزامی را به درستی پر کنید');
      return;
    }

    this.loading = true;
    const formData = new FormData();
    if (this.isEditMode && this.unitId) {
      formData.append('unitId', this.unitId.toString());
    }
    formData.append('Name', this.userForm.get('name')?.value);
    formData.append('description', this.userForm.get('description')?.value);
    formData.append('isActive', this.userForm.get('isActive')?.value);

    const request = this.isEditMode && this.unitId
      ? this.api.updateUnit(this.unitId, formData)
      : this.api.createUnit(formData);

    request.subscribe({
      next: () => {
        this.showSuccess(this.isEditMode ? 'واحد/سازمان با موفقیت ویرایش شد' : ',واحد/سازمان با موفقیت ایجاد شد');
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
        } else if (err.message) {
          errorMsg = err.message;
        }
        this.showError(errorMsg);
      }
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
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