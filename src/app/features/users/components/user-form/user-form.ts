import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, TreeNode } from 'primeng/api';
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
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../../shared/message-dialog-component/message-dialog-component';
import { TreeSelectModule } from 'primeng/treeselect';

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
    MessageDialogComponent,
    ConfirmDialogComponent,
    TreeSelectModule,
    FormsModule 
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
  selectedUnitKey: TreeNode | null = null;
  statusOptions = [
    { label: 'فعال', value: 'Active' },
    { label: 'غیرفعال', value: 'Inactive' }
  ];
  unitNodes: TreeNode[] = [];

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

  async ngOnInit() {
    this.initForm();

    await this.loadRoles();
    await this.loadUits();

    if (this.isEditMode && this.userId) {
        await this.loadUserData();
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
      unitId: [null, Validators.required],
      nationalNo: ['', Validators.required],
      phoneNumber: ['', Validators.required],

    });
    if (this.isEditMode) {
      this.userForm.get('password')?.disable();
    }
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
    this.unitNodes = this.buildTree(res);
  }


getRoleNameById(roleId: number): string {
  const role = this.userRoles.find(r => r.roleId === roleId);
  return role ? role.roleName : '';
}
getUnitNameById(unitId: number): string {
  const unit = this.userUnit.find(r => r.unitId === unitId);
  return unit?.name ?? 'نامشخص';
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

unitId!: null
async loadUserData() {
  try {
    const data = await lastValueFrom(this.api.GetUserById(this.userId!));
    
    
    let birthDate = null;
    if (data.dateOfBirth) {
      birthDate = new Date(data.dateOfBirth);
    }

 
   // const unitIds = data.unitIds || data.unitId || data.unitid || [];
    const roleIds = data.roleIds || data.roleId || [];

    const unitId =
    data.unitid?.length
        ? data.unitid[0].toString()
        : null;

const selectedNode =
    unitId
        ? this.findNode(this.unitNodes, unitId)
        : null;

this.userForm.patchValue({

    name: data.name,
    family: data.family,
    username: data.userName,
    email: data.email,
    dateOfBirth: birthDate,
    status: data.status,
    roleId: roleIds,

    unitId: selectedNode,

    nationalNo: data.nationalNo,
    phoneNumber: data.phoneNumber

});
    
    if (data.photo) {
      this.imagePreview = `data:image/jpeg;base64,${data.photo}`;
    }
    
  } catch (error) {
    this.showError('خطا در دریافت اطلاعات کاربر');
  }
}

private findNode(nodes: TreeNode[], key: string): TreeNode | null {

  for (const node of nodes) {

      if (node.key === key)
          return node;

      if (node.children?.length) {

          const found = this.findNode(node.children, key);

          if (found)
              return found;
      }
  }

  return null;
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

  onUnitSelect(event: any) {

    this.userForm.patchValue({
        unitId: [event.node.data.unitId]
    });

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
    formData.append('Name', this.userForm.get('name')?.value || '');
    formData.append('Family', this.userForm.get('family')?.value || '');
    formData.append('UserName', this.userForm.get('username')?.value || '');
    formData.append('Email', this.userForm.get('email')?.value || '');
    
    const nationalNo = this.userForm.get('nationalNo')?.value || '';
  formData.append('NationalNo', nationalNo.toString());
  
  const phoneNumber = this.userForm.get('phoneNumber')?.value || '';
  formData.append('PhoneNumber', phoneNumber.toString());
    
    formData.append('Status', this.userForm.get('status')?.value || 'Active');
  
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
  
    if (!this.isEditMode) {
      formData.append(
          'Password',
          this.userForm.get('password')!.value
      );
  }
  
    const roleIds = this.userForm.get('roleId')?.value || [];
    roleIds.forEach((id: number) => {
      formData.append('RoleId', id.toString());
    });
  
    const node: TreeNode = this.userForm.value.unitId;

    formData.append(
        'UnitId',
        node.data.unitId.toString()
    );

    if (this.selectedFile) {
      formData.append('Photo', this.selectedFile);
    }
  

  
    const request = this.isEditMode && this.userId
      ? this.api.UpdateUser(this.userId, formData)
      : this.api.CreateEmployee(formData);
  
    request.subscribe({
      next: (res) => {
        const message = this.isEditMode ? 'کاربر با موفقیت ویرایش شد' : 'کاربر با موفقیت ایجاد شد';
        this.showSuccess(message);
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
    if (control) {
      console.log(`🔍 ${controlName}:`, {
        value: control.value,
        invalid: control.invalid,
        touched: control.touched,
        dirty: control.dirty,
        errors: control.errors
      });
    }
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