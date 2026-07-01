import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

export type MessageDialogType = 'success' | 'error' | 'warning' | 'info';

@Component({
  selector: 'app-message-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './message-dialog-component.html',
  styleUrls: ['./message-dialog-component.scss']
})
export class MessageDialogComponent {
  @Input() visible = false;
  @Input() title = '';
  @Input() message = '';
  @Input() type: MessageDialogType = 'info';
  @Input() confirmText = 'تایید';
  @Input() showCancel = false;
  @Input() cancelText = 'انصراف';
  @Input() loading = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  get iconClass(): string {
    const icons = {
      success: 'pi pi-check-circle',
      error: 'pi pi-times-circle',
      warning: 'pi pi-exclamation-triangle',
      info: 'pi pi-info-circle'
    };
    return icons[this.type] || icons.info;
  }

  get iconColorClass(): string {
    return this.type;
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