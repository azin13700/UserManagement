// core/components/confirm-dialog/confirm-dialog.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './confirm-dialog-component.html',
  styleUrls: ['./confirm-dialog-component.scss']
})
export class ConfirmDialogComponent {
  @Input() visible = false;
  @Input() title = 'تأیید';
  @Input() message = 'آیا از انجام این عملیات مطمئن هستید؟';
  @Input() confirmText = 'تایید';
  @Input() cancelText = 'انصراف';
  @Input() loading = false;
  @Input() confirmSeverity: 'success' | 'danger' | 'primary' = 'primary';

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  get severityClass(): string {
    return this.confirmSeverity;
  }

  close() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  confirm() {
    this.onConfirm.emit();
    if (!this.loading) {
      this.close();
    }
  }

  cancel() {
    this.onCancel.emit();
    this.close();
  }
}