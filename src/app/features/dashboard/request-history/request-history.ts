import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../../core/services/api-service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';
import { HistoryDto } from '../../../core/models/HistoryDto';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-request-history',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    FormsModule ,
    FloatLabelModule,
    MessageDialogComponent,
    ConfirmDialogComponent

  ],  templateUrl: './request-history.html',
  styleUrl: './request-history.scss',
})
export class RequestHistory implements OnInit{

  statusLoading: { [key: number]: boolean } = {};
 listHistory :HistoryDto[] = [];

 requestId:any;
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


  constructor(
   
    private fb: FormBuilder,
    private api: ApiService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig
  ) {
       this.requestId = this.config.data?.requestId || null;
  }
   ngOnInit() {  
       this.loadSubjectData();
   }

 
   async loadSubjectData() {
     try {
       this.listHistory = await lastValueFrom(this.api.getRequestHistory(this.requestId!));
       
       
     } catch (error) {
       this.showError('خطا در دریافت اطلاعات موضوع');
     }
   }

  
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
