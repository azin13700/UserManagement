import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { TreeSelectModule } from 'primeng/treeselect';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ApiService } from '../../../core/services/api-service';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TreeNode } from 'primeng/api';
import { UnitDto } from '../../../core/models/UnitDto';
import { lastValueFrom } from 'rxjs';
import { SubjectDto } from '../../../core/models/SubjectDto';
import { StatusDto } from '../../../core/models/StatusDto';
import { FloatLabelModule } from 'primeng/floatlabel';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-answer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TextareaModule,
    FormsModule ,
    SelectModule,
    TreeSelectModule,
    FloatLabelModule

  ],
  templateUrl: './answer.html',
  styleUrl: './answer.scss',
})
export class Answer implements OnInit {



  selectedUnitKey: string | null = null;
  answerserForm!: FormGroup;
  isEditMode = false;
  unitId: number | null = null;
  userId: number | null = null;
  roleId!:number;
  loading = false;
   userUnit:UnitDto[]=[];
   unitNodes: TreeNode[] = [];

   selectedUnitId: number | null = null;
   status:StatusDto[]= [];
   requestId:string='';
    
      subjects: SubjectDto[] = [];
      filteredSubSubjects: SubjectDto[] = [];
  constructor(
   
    private fb: FormBuilder,
    private auth:AuthService,
    private api: ApiService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
   // this.isEditMode = this.config.data?.mode === 'edit';
  this.requestId = this.config.data?.requestId || null;
  this.unitId = this.config.data?.unitId || null;
  this.userId = this.config.data?.userId || null;
  }

  ngOnInit(): void {
    this.roleId = this.auth.getSelectedRole().roleId;
  this.initForm();

  this.loadStatus();
  }

  initForm() {
    this.answerserForm = this.fb.group({
      stateId: [''],
      answer: [''],
      requestId:[''],
      unitId:[''],
      userId:['']
  
    });
  }
  


  loadStatus(): void {

    this.loading = true;

  
    this.api.getStatusByRole(this.roleId).subscribe({
  
      next: (res) => {
  
       
  
        this.status = res;
  
  
        this.loading = false;
      },
  
      error: (err) => {
        console.log(err);
        this.loading = false;
      }
  
    });
  
  } 




  isInvalid(arg0: string) {
  
    }
    close() {
  
    }
    onSubmit() {
      console.log(this.status);
      console.log(this.answerserForm.value);

      this.loading = true;
      const formData = new FormData();
      
      formData.append('requestId', String(this.requestId ?? ''));
      formData.append('answer', this.answerserForm.get('answer')?.value ?? '');
      formData.append('stateId', String(this.answerserForm.get('stateId')?.value ?? ''));
      formData.append('unitId', String(this.unitId ?? ''));
      formData.append('userId', String(this.userId ?? ''));
      lastValueFrom(this.api.createAnswer(   formData));
      this.showSuccess('وضعیت با موفقیت ایجاد شد');
      this.loading = false;
      this.ref.close(true);

    
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
}
