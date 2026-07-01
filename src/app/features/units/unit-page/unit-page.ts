
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ApiService } from '../../../core/services/api-service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { lastValueFrom } from 'rxjs';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';

@Component({
  selector: 'app-unit-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TextareaModule,
    MessageDialogComponent,
    ConfirmDialogComponent
  ],
  providers: [MessageService],
  templateUrl: './unit-page.html',
  styleUrls: ['./unit-page.scss']
})
export class UnitPage implements OnInit {
  private api = inject(ApiService);
  private messageService = inject(MessageService);

  userForm!: FormGroup;
  isEditMode = false;
  unitId: number | null = null;
  loading = false;
  
 
  parentId: number | null = null;

  statusOptions = [
    { label: 'فعال', value: true },
    { label: 'غیرفعال', value: false }
  ];

  constructor(
    private fb: FormBuilder,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.isEditMode = this.config.data?.mode === 'edit';
    this.unitId = this.config.data?.unitId || null;
    this.parentId = this.config.data?.parentUnitId || null;  // ✅ دریافت ParentId
  }

  ngOnInit() {
    this.initForm();
    if (this.isEditMode && this.unitId) {
      this.loadUnitData();
    }
  }

  initForm() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      isActive: [true, Validators.required]
    });
  }

  async loadUnitData() {
    try {
      const data = await lastValueFrom(this.api.getUnitById(this.unitId!));
      
      this.userForm.patchValue({
        name: data.name,
        description: data.description || '',
        isActive: data.isActive
      });
      
    } catch (error) {
      this.showError('خطا در دریافت اطلاعات واحد');
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
    formData.append('Name', this.userForm.get('name')?.value || '');
    formData.append('Description', this.userForm.get('description')?.value || '');
    formData.append('IsActive', this.userForm.get('isActive')?.value ? 'true' : 'false');


    if (this.parentId) {
      formData.append('ParentId', this.parentId.toString());
    }

    if (this.isEditMode && this.unitId) {
      formData.append('UnitId', this.unitId.toString());
      
      this.api.updateUnit(this.unitId, formData).subscribe({
        next: () => {
          this.showSuccess('واحد با موفقیت ویرایش شد');
          this.loading = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.loading = false;
          this.showError(err.error?.message || 'خطا در ویرایش واحد');
        }
      });
    } else {

      this.api.createUnit(formData).subscribe({
        next: () => {
          this.showSuccess(this.parentId ? 'زیرمجموعه با موفقیت ایجاد شد' : 'واحد با موفقیت ایجاد شد');
          this.loading = false;
          this.ref.close(true);
        },
        error: (err) => {
          this.loading = false;
          console.error('❌ خطا:', err);
          this.showError(err.error?.message || 'خطا در ایجاد واحد');
        }
      });
    }
  }

  isInvalid(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return control ? (control.invalid && (control.touched || control.dirty)) : false;
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
  close() {
    this.ref.close();
  }
}