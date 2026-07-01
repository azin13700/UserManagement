import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService, ConfirmationService, TreeNode } from 'primeng/api';
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
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';
import { TreeSelectModule } from 'primeng/treeselect';

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
    SelectModule,
    TextareaModule,
    MessageDialogComponent,
    ConfirmDialogComponent,
    TreeSelectModule,
    FileUploadModule,
  ],
  templateUrl: './request-page.html',
  styleUrl: './request-page.scss',
})
export class RequestPage implements OnInit {
isEditMode: any;
removeImage() {
throw new Error('Method not implemented.');
}
  private fb = inject(FormBuilder);
  private api = inject(ApiService);

  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
    private authService = inject(AuthService);
  loading = false;

  requestForm!: FormGroup;

  subjects: SubjectDto[] = [];
  subSubjects: SubjectDto[] = [];

  unitNodes: TreeNode[] = [];

  selectedUnitKey: string | null = null;

  selectedFile?: File;
  imagePreview?: string;

  ngOnInit(): void {

      this.createForm();

      this.loadInitialData();

  }
  private loadInitialData(){

    this.loadSubjects();

    this.loadUnits();

}
loadSubjects(){

  this.api.GetAllSubject().subscribe({

      next:res=>{

          this.subjects=res;

      }

  });

}

  private createForm(){

    this.requestForm=this.fb.group({

        subjectId:[null,Validators.required],

        subSubjectId:[null,Validators.required],

        description:['',Validators.required],

        unitId:[null,Validators.required],

        isActive:['Active']

    });

}

onSubjectChange(event:any){

  const id=event.value;

  this.requestForm.patchValue({

      subjectId:id,

      subSubjectId:null

  });

  this.subSubjects=[];

  if(!id)
      return;

  this.api.GetSubSubjects(id).subscribe({

      next:res=>{

          this.subSubjects=res;

      }

  });

}
loadUnits(){


  this.api.GetAllUnits().subscribe({
    next: res => {

      console.log(res);

      this.unitNodes = this.buildTree(res);

      console.log(this.unitNodes);

    }
  });

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

onUnitChange(event:any){

  this.requestForm.patchValue({

    unitId:Number(event.value)

});

}


onFileSelected(event:any){

  const file=event.files[0];

  if(!file)
      return;

  this.selectedFile=file;

  const reader=new FileReader();

  reader.onload=e=>{

      this.imagePreview=(e.target as any).result;

  };

  reader.readAsDataURL(file);

}


submit(){
  console.log(this.unitNodes);
  const selectedNode = this.selectedUnitKey as any;

  const unitId = selectedNode.data.unitId;
  this.loading=true;

  const value=this.requestForm.value;

  const formData=new FormData();
  formData.append("UnitId", String(unitId));


  const userId = this.authService.getUserId();
  console.log(this.selectedUnitKey);

  formData.append("CreatedByUserId", String(userId));
  formData.append("Description",value.description);

  formData.append("SubSubjectId",value.subSubjectId);


  formData.append("IsActive",value.isActive);

  if(this.selectedFile){

      formData.append("Photo",this.selectedFile);

  }

  this.api.CreateRequest(formData).subscribe({

      next:res=>{

          this.loading=false;
this.showSuccess(res.message);
          this.reset();

      },

      error:()=>{

          this.loading=false;

      }

  });

}

reset(){

  this.requestForm.reset({

      isActive:"Active"

  });

  this.selectedFile=undefined;

  this.imagePreview=undefined;

  this.selectedUnitKey=null;

  this.subSubjects=[];

}
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
  // ====== متدهای دیالوگ ======
  showSuccess(message: string) {
    this.messageDialogTitle = 'موفق';
    this.messageDialogMessage = message;
    this.messageDialogType = 'success';
    this.messageDialogVisible = true;
    this.messageDialogLoading = false;
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