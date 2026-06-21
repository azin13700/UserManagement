import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { lastValueFrom } from 'rxjs';
import { ApiService } from '../../../core/services/api-service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-role-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TextareaModule
  ],
  templateUrl: './role-page.html',
  styleUrl: './role-page.scss',
})
export class RolePage implements OnInit {
  
  private api = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  userForm!: FormGroup;
  isEditMode = false;
  roleId: number | null = null;
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
    this.roleId = this.config.data?.roleId || null;
  }

  ngOnInit() {
    this.initForm();

    
    if (this.isEditMode && this.roleId) {
      this.loadUserData();
    }
  }
  initForm() {
    this.userForm = this.fb.group({
      roleName: ['', Validators.required],
      description: ['', Validators.required],
      isActive:['Active'],
    });
  }
  async loadUserData() {
    try {
      const data = await lastValueFrom(this.api.GetRoleById(this.roleId!));

      this.userForm.patchValue({
        roleName: data?.roleName,
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
    if (this.isEditMode && this.roleId) {
      formData.append('roleId', this.roleId.toString());
    }
    formData.append('roleName', this.userForm.get('roleName')?.value);
    formData.append('description', this.userForm.get('description')?.value);
    formData.append('isActive', this.userForm.get('isActive')?.value);


    const request = this.isEditMode && this.roleId
      ? this.api.updateRole(this.roleId, formData)
      : this.api.createRole(formData);

    request.subscribe({
      next: () => {
        this.showSuccess(this.isEditMode ? 'نقش با موفقیت ویرایش شد' : ',نقش با موفقیت ایجاد شد');
        this.loading = false;
        this.ref.close(true);
      },
      error: (err) => {
        this.loading = false;
        let errorMsg = 'خطا در انجام عملیات';
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
