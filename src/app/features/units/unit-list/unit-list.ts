import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../../core/services/api-service';
import { UnitDto } from '../../../core/models/UnitDto';
import { UnitPage } from '../unit-page/unit-page';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-unit-list',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    DialogModule,
    InputIconModule,
    TableModule,
    TagModule,
    ToastModule,
    CommonModule,
    InputTextModule,
    MessageModule,
    ReactiveFormsModule,
    ChipModule
  ],
  templateUrl: './unit-list.html',
  styleUrl: './unit-list.scss',
})
export class UnitList implements OnInit {
  private messageService = inject(MessageService);
  private dialogService = inject(DialogService);
  private userService = inject(ApiService);
  private confirmationService = inject(ConfirmationService);

  units: UnitDto[] = [];
  filteredUnits: UnitDto[] = [];
  selectedUnits: UnitDto[] = [];
  
  loading = false;
  searchValue = '';
  statusLoading: { [key: number]: boolean } = {};
  
  currentPage = 1;
  rowsPerPage = 10;
  totalRecords = 0;

  constructor() {}

  ngOnInit() {
    this.loadUnits();
  }

  loadUnits() {
    this.loading = true;
    this.userService.GetAllUnits().subscribe({
      next: (res: UnitDto[]) => {
        this.units = res.map(unit => ({
          ...unit,
          isActive: unit.isActive !== undefined ? unit.isActive : true
        }));
        this.filteredUnits = [...this.units];
        this.totalRecords = this.filteredUnits.length;
        this.loading = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'خطا',
          detail: 'بارگذاری واحدها با مشکل مواجه شد',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;
    
    if (!value.trim()) {
      this.filteredUnits = [...this.units];
    } else {
      const searchTerm = value.toLowerCase().trim();
      this.filteredUnits = this.units.filter(unit =>
        unit.name?.toLowerCase().includes(searchTerm) ||
        unit.description?.toLowerCase().includes(searchTerm)
      );
    }
    this.totalRecords = this.filteredUnits.length;
    this.currentPage = 1;
  }

  getPaginatedUnits(): UnitDto[] {
    const start = (this.currentPage - 1) * this.rowsPerPage;
    const end = start + this.rowsPerPage;
    return this.filteredUnits.slice(start, end);
  }

  onPageChange(event: any) {
    this.currentPage = event.first / event.rows + 1;
    this.rowsPerPage = event.rows;
  }

  toggleUnitStatus(unit: UnitDto) {
    const newStatus = !unit.isActive;
    const action = newStatus ? 'فعال' : 'غیرفعال';
    
    Swal.fire({
      title: `${action} کردن واحد`,
      text: `آیا از ${action} کردن "${unit.name}" مطمئن هستید؟`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'انصراف'
    }).then((result) => {
      if (result.isConfirmed) {
        this.statusLoading[unit.unitId] = true;
        
        this.userService.ToggleUnitStatus(unit).subscribe({
          next: () => {
            unit.isActive = newStatus;
            this.showSuccess(`واحد با موفقیت ${action} شد`);
            this.statusLoading[unit.unitId] = false;
          },
          error: (err) => {
            this.showError('تغییر وضعیت انجام نشد');
            this.statusLoading[unit.unitId] = false;
            console.error(err);
          }
        });
      }
    });
  }

  openNew() {
    const ref = this.dialogService.open(UnitPage, {
      header: 'ایجاد واحد جدید',
      width: '80%',
      closable: true,  
      closeOnEscape: true, 
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { mode: 'create' }
    });


    ref?.onClose.subscribe((result) => {
      if (result) {
        this.loadUnits();
        this.messageService.add({
          severity: 'success',
          summary: 'موفق',
          detail: 'واحد با موفقیت ایجاد شد',
          life: 4000
        });
      }
    });
  }

  editUnit(unit: UnitDto) {
    const ref = this.dialogService.open(UnitPage, {
      header: 'ویرایش واحد',
      width: '80%',
      closable: true,  
      closeOnEscape: true, 
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: { 
        mode: 'edit', 
        unitId: unit.unitId 
      }
    });
    ref?.onClose.subscribe((result) => {
      if (result) {
        this.loadUnits();
        this.messageService.add({
          severity: 'success',
          summary: 'موفق',
          detail: 'واحد با موفقیت ویرایش شد',
          life: 4000
        });
      }
    });
  
  }



  refresh() {
    this.loadUnits();
    this.searchValue = '';
    this.selectedUnits = [];
    this.currentPage = 1;
  }

  clearSearch(table: Table) {
    this.searchValue = '';
    this.filteredUnits = [...this.units];
    this.totalRecords = this.filteredUnits.length;
    table.filterGlobal('', 'contains');
  }

  showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'موفق', detail: msg, life: 3000 });
  }

  showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'خطا', detail: msg, life: 3000 });
  }
}