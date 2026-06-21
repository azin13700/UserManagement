import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { FileUploadModule } from 'primeng/fileupload';
import { ApiService } from '../../../../core/services/api-service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { lastValueFrom } from 'rxjs';
import { UnitDto } from '../../../../core/models/UnitDto';

interface UserRole {
  roleId: number;
  roleName: string;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MultiSelectModule,
    FileUploadModule,
    ToastModule,
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss'],
})
export class UserForm implements OnInit {
  userForm!: FormGroup;
  loading = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  userRoles: UserRole[] = [];
  userUnit:UnitDto[]=[];
  isEditMode = false;
  userId: number | null = null;
  rolesLoading = false;

  statusOptions = [
    { label: 'فعال', value: 'Active' },
    { label: 'غیرفعال', value: 'Inactive' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private api: ApiService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
    this.isEditMode = this.config.data?.mode === 'edit';
    this.userId = this.config.data?.userId || null;
  }

  ngOnInit() {
    this.initForm();
    this.loadRoles();
    this.loadUits();
    
    if (this.isEditMode && this.userId) {
      this.loadUserData();
    }
  }

  initForm() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      family: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dateOfBirth: [null, Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      status: ['Active'],
      roleId: [[], Validators.required],
      unitId: [[], Validators.required],
      nationalNo: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{11}$')]],
    });
  }

  async loadRoles() {
    try {
      const res = await lastValueFrom(this.api.GetAllRoles());
      this.userRoles = res.map(r => ({ 
        roleId: r.roleId || r.id, 
        roleName: r.roleName || r.name 
      }));
    } catch (error) {
      this.showError('بارگذاری نقش‌ها با مشکل مواجه شد');
    }
  }

  async loadUits(){
    const res = await lastValueFrom(this.api.GetAllUnits());
    this.userUnit = res.map(r => ({ 
      unitId: r.unitId || r.id, 
      name:  r.name || ''
    }));
  }


getRoleNameById(roleId: number): string {
  const role = this.userRoles.find(r => r.roleId === roleId);
  return role ? role.roleName : '';
}
getUnitNameById(unitId: number): string {
  const unit = this.userUnit.find(r => r.unitId === unitId);
  return unit?.name ?? 'نامشخص';
}


async loadUserData() {
  try {
    const data = await lastValueFrom(this.api.GetUserById(this.userId!));
  
    
    let birthDate = null;
    if (data.dateOfBirth) {
      birthDate = new Date(data.dateOfBirth);
    }
    
    const unitIds = data.unitIds || data.unitId || data.unitid || [];
    const roleIds = data.roleIds || data.roleId || [];

    
    this.userForm.patchValue({
      name: data.name,
      family: data.family,
      username: data.userName || data.username,
      email: data.email,
      dateOfBirth: birthDate,
      status: data.status || 'Active',
      roleId: roleIds,
      photo: data.photo ? `data:image/jpeg;base64,${data.photo}` : null,
      unitId: unitIds, 
      nationalNo: data.nationalNo,
      phoneNumber: data.phoneNumber,
    });
    
    this.imagePreview =data.photo ? `data:image/jpeg;base64,${data.photo}` : null;
    
  } catch (error) {

    this.showError('خطا در دریافت اطلاعات کاربر');
  }
}

  onFileSelected(event: any) {
    const file = event.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => (this.imagePreview = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
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
  
    
    if (this.isEditMode && this.userId) {
      formData.append('UserId', this.userId.toString());
    }
    formData.append('Name', this.userForm.get('name')?.value);
    formData.append('Family', this.userForm.get('family')?.value);
    formData.append('UserName', this.userForm.get('username')?.value);
    formData.append('Email', this.userForm.get('email')?.value);
    formData.append('NationalNo', this.userForm.get('nationalNo')?.value);
    formData.append('PhoneNumber', this.userForm.get('phoneNumber')?.value);
    formData.append('Status', this.userForm.get('status')?.value);
  

    const dateValue = this.userForm.get('dateOfBirth')?.value;
    if (dateValue) {
      let formattedDate: string;
      if (dateValue instanceof Date) {
        const year = dateValue.getFullYear();
        const month = String(dateValue.getMonth() + 1).padStart(2, '0');
        const day = String(dateValue.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      } else {
        const date = new Date(dateValue);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
      }
      formData.append('DateOfBirth', formattedDate);
    }
  

    const password = this.userForm.get('password')?.value;
    if (password) {
      formData.append('Password', password);
    }
  

    const roleIds = this.userForm.get('roleId')?.value || [];
    roleIds.forEach((id: number) => {
      formData.append('RoleId', id.toString());
    });
  

    const unitIds = this.userForm.get('unitId')?.value || [];
    unitIds.forEach((id: number) => {
      formData.append('UnitId', id.toString());  // ✅ درست: UnitId
    });
  

    if (this.selectedFile) {
      formData.append('Photo', this.selectedFile);
    }
  

    const request = this.isEditMode && this.userId
      ? this.api.UpdateUser(this.userId, formData)
      : this.api.CreateEmployee(formData);
  
    request.subscribe({
      next: () => {
        this.showSuccess(this.isEditMode ? 'کاربر با موفقیت ویرایش شد' : 'کاربر با موفقیت ایجاد شد');
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