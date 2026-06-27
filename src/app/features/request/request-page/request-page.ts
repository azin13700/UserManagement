import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileSelectEvent, FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../../core/services/api-service';
import { SelectModule } from 'primeng/select';
import { lastValueFrom } from 'rxjs';
import { UnitDto } from '../../../core/models/UnitDto';
import { SubjectDto } from '../../../core/models/SubjectDto';
import { TextareaModule } from 'primeng/textarea';
import { AuthService } from '../../../core/services/auth-service';



interface Unit {
  unitId: number;
  name: string;
}

interface Request {
  id: number;
  subjectId: number;
  subjectTitle: string;
  subSubjectId: number;
  subSubjectTitle: string;
  description: string;
  unitId: number;
  unitName: string;
  photo: string | null;
  status: string;
  createdAt: string;
  createdBy: string;
}
@Component({
  selector: 'app-request-page',
  standalone: true,
  imports: [ 
     CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    InputTextModule,
    SelectModule ,
    TextareaModule,
   // InputTextareaModule,
   // DropdownModule,
    FileUploadModule,],
  templateUrl: './request-page.html',
  styleUrl: './request-page.scss',
})
export class RequestPage implements OnInit {

  userForm!: FormGroup;
  private api = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
    private authService = inject(AuthService);
  
  private fb = inject(FormBuilder);
   requests: Request[] = [];
   filteredRequests: Request[] = [];
   selectedRequests: Request[] = [];
   loading = false;
   searchValue = '';
   userUnit:UnitDto[]=[];
   currentPage = 1;
   rowsPerPage = 10;
   totalRecords = 0;
 
   dialogVisible = false;
   isEditMode = false;

 
   subjects: SubjectDto[] = [];
   filteredSubSubjects: SubjectDto[] = [];
   units: Unit[] = [];
 
   statusOptions = [
     { label: 'در انتظار', value: 'در انتظار' },
     { label: 'در حال بررسی', value: 'در حال بررسی' },
     { label: 'تایید شده', value: 'تایید شده' },
     { label: 'رد شده', value: 'رد شده' }
   ];
 
   statusLoading: { [key: number]: boolean } = {};
   selectedFile: File | null = null;
   imagePreview: string | null = null;
 
  ngOnInit(): void {
    this.initForm();
    this.LoadSubjects();
    this.loadUits();
  }
  initForm() {
    this.userForm = this.fb.group({
      description: ['', Validators.required],
      photo: ['', Validators.required],
      isActive: ['Active'],
      subSubjectId: ['', Validators.required],
      subjectId: [''],
      unitId: ['', Validators.required],
      createdByUserId:[''],
      requestId:['']
    });

 
  }
  async LoadSubjects(){
    try {
      const res = await lastValueFrom(this.api.GetAllSubject());
      this.subjects = res.map(r => ({ 
        subjectId: r.subjectId || r.subjectId, 
        title: r.title ,
        parentId: r.parentId ,
        isActive:true
      }));
    } catch (error) {
    //this.showError('بارگذاری نقش‌ها با مشکل مواجه شد');
    }
  }

  async loadUits(){
    try {
      const res = await lastValueFrom(this.api.GetAllUnits());
      this.units = res.map(r => ({ 
        unitId: r.unitId || r.id, 
        name: r.name 
      }));
    } catch (error) {
    //  this.showError('بارگذاری نقش‌ها با مشکل مواجه شد');
    }
  }
  onSubjectChange(event: any) {
    const subjectId = event.value;
    this.userForm.patchValue({ subjectId: subjectId });
    
    if (subjectId) {
  
    this.api.GetSubSubjects(subjectId).subscribe({
      next: (res) => {
        this.filteredSubSubjects = res.map(r => ({ 
          subjectId: r.subjectId || r.subjectId, 
          title: r.title ,
          parentId: r.parentId ,
          isActive:true
        }));
      },
      error: (err) => {
        this.loading = false;
        let errorMsg = 'خطا در انجام عملیات';
      }
    });
    } else {
      this.filteredSubSubjects = [];
    }
  }
  onUnitChange(event: any) {
    const unitId = event.value;
    this.userForm.patchValue({ unitId: unitId });
    }

    onSubSubjectChange(event:any){
      const subSubjectId = event.value;
      this.userForm.patchValue({ subSubjectId: subSubjectId });
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
  
    resetForm() {
    throw new Error('Method not implemented.');
    }


    removeImage() {
      this.selectedFile = null;
      this.imagePreview = null;
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
    onSubmit() {
    
      // if (this.userForm.invalid) {
      //   Object.keys(this.userForm.controls).forEach(key => {
      //     const control = this.userForm.get(key);
      //     if (control?.invalid) {
      //       control.markAsTouched();
      //     }
      //   });
               
      //   this.showError('لطفاً همه فیلدهای الزامی را به درستی پر کنید');
      //   return;
      // }
      const userId = this.authService.getUserId();

      this.loading = true;
      const formData = new FormData();   
      formData.append('CreatedByUserId', userId?.toString() || '');
      formData.append('Description', this.userForm.get('description')?.value || '');
      formData.append('SubSubjectId', this.userForm.get('subSubjectId')?.value || '');
      formData.append('UnitId', this.userForm.get('unitId')?.value || '');
      
      formData.append('IsActive', this.userForm.get('isActive')?.value || 'Active');
    
      if (this.selectedFile) {
        formData.append('Photo', this.selectedFile);
      }
    
    
      this.api.CreateRequest(formData).subscribe({
        next: (res) => {
         // const message = 'کاربر با موفقیت ایجاد شد';
          this.showSuccess(res.message);
          this.loading = false;
        //  this.ref.close(true);
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
    showSuccess(msg: string) {
      this.messageService.add({ severity: 'success', summary: 'موفق', detail: msg, life: 3000 });
    }
  
    showError(msg: string) {
      this.messageService.add({ severity: 'error', summary: 'خطا', detail: msg, life: 3000 });
    } 
}
