import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TreeTableModule } from 'primeng/treetable';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ApiService } from '../../../core/services/api-service';
import { DialogService } from 'primeng/dynamicdialog';
import { lastValueFrom } from 'rxjs';
import { UnitPage } from '../unit-page/unit-page';
import { MessageDialogComponent } from '../../../shared/message-dialog-component/message-dialog-component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog-component/confirm-dialog-component';

interface Unit {
  unitId: number;
  name: string;
  description?: string;
  parentUnitId?: number | null;
  isActive: boolean;
  userCount: number;
  createdAt: string;
  children?: Unit[];
  parentId: number;
}

interface TreeNode {
  data: Unit;
  children?: TreeNode[];
  expanded?: boolean;
}

@Component({
  selector: 'app-list-unit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TreeTableModule,
    TagModule,
    ToastModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    MessageDialogComponent,
    ConfirmDialogComponent
  ],
  providers: [MessageService, ConfirmationService, DialogService],
  templateUrl: './unit-list.html',
  styleUrls: ['./unit-list.scss']
})
export class UnitList implements OnInit {
  private api = inject(ApiService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private dialogService = inject(DialogService);


  units: Unit[] = [];
  treeData: TreeNode[] = [];
  filteredTreeData: TreeNode[] = [];
  loading = false;
  searchValue = '';

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

  
  columns = [
    { field: 'name', header: 'نام واحد' },
    { field: 'userCount', header: 'تعداد کاربران' },
    { field: 'isActive', header: 'وضعیت' },
    { field: 'edit', header: 'ویرایش' },
    { field: 'addChild', header: 'زیرمجموعه' }
  ];


  currentPage = 1;
  rowsPerPage = 10;
  totalRecords = 0;


  statusLoading: { [key: number]: boolean } = {};

  ngOnInit() {
    this.loadUnits();
  }

  async loadUnits() {
    this.loading = true;
    try {
      const data = await lastValueFrom(this.api.GetAllUnits());
      this.units = data;
      this.buildTree();
      this.totalRecords = this.units.length;
    } catch (error) {
      this.showError('خطا در بارگذاری واحدها');
    } finally {
      this.loading = false;
    }
  }


  buildTree() {
    const unitMap = new Map<number, TreeNode>();

    this.units.forEach(unit => {
      unitMap.set(unit.unitId, {
        data: { ...unit, children: [] },
        children: [],
        expanded: true
      });
    });

    const roots: TreeNode[] = [];

    this.units.forEach(unit => {
      const node = unitMap.get(unit.unitId);
      if (!node) return;
      
      if (unit.parentId && unitMap.has(unit.parentId)) {
        const parent = unitMap.get(unit.parentId);
        if (parent) {
          parent.children!.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    this.treeData = roots;
    this.filteredTreeData = roots;
  }


  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue = value;
    this.applyFilter();
  }

  applyFilter() {
    if (!this.searchValue.trim()) {
      this.filteredTreeData = this.treeData;
      this.totalRecords = this.units.length;
      return;
    }

    const term = this.searchValue.toLowerCase().trim();
    const filtered = this.filterTree(this.treeData, term);
    this.filteredTreeData = filtered;
    this.totalRecords = this.countNodes(filtered);
  }

  filterTree(nodes: TreeNode[], term: string): TreeNode[] {
    const result: TreeNode[] = [];

    nodes.forEach(node => {
      const matches = node.data.name.toLowerCase().includes(term) ||
                      (node.data.description?.toLowerCase().includes(term) || false);
      
      const filteredChildren = node.children ? this.filterTree(node.children, term) : [];

      if (matches || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children,
          expanded: true
        });
      }
    });

    return result;
  }

  countNodes(nodes: TreeNode[]): number {
    let count = nodes.length;
    nodes.forEach(node => {
      if (node.children) {
        count += this.countNodes(node.children);
      }
    });
    return count;
  }


  openNew() {
    const ref = this.dialogService.open(UnitPage, {
      header: 'ایجاد واحد جدید',
      width: '600px',
      contentStyle: { overflow: 'auto' },
      data: { mode: 'create' }
    });
    ref?.onClose.subscribe(result => {
      if (result)
        this.showSuccess(`واحد با موفقیت ایجاد شد`);
        this.loadUnits();
    });
  }


  editUnit(unit: Unit) {
    const ref = this.dialogService.open(UnitPage, {
      header: 'ویرایش واحد',
      width: '600px',
      contentStyle: { overflow: 'auto' },
      data: { mode: 'edit', unitId: unit.unitId }
    });
    ref?.onClose.subscribe(result => {
      if (result)
        this.showSuccess(`واحد با موفقیت ویرایش شد`);
        this.loadUnits();
    });
  }


  addChild(unit: Unit) {
    const ref = this.dialogService.open(UnitPage, {
      header: `افزودن زیرمجموعه برای ${unit.name}`,
      width: '600px',
      contentStyle: { overflow: 'auto' },
      data: { 
        mode: 'create', 
        parentUnitId: unit.unitId 
      }
    });
    ref?.onClose.subscribe(result => {
      if (result) 
        this.showSuccess(`واحد با موفقیت ایجاد شد`);
        this.loadUnits();
    });
  }


  toggleStatus(unit: Unit) {
    const newStatus = !unit.isActive;
    const action = newStatus ? 'فعال' : 'غیرفعال';
    
    this.showConfirm(
      'تغییر وضعیت',
      `آیا از ${action} کردن واحد "${unit.name}" مطمئن هستید؟`,
      async () => {
        this.statusLoading[unit.unitId] = true;
        try {
          await lastValueFrom(this.api.ToggleUnitStatus(unit.unitId));
          unit.isActive = newStatus;
          this.showSuccess(`واحد با موفقیت ${action} شد`);
        } catch (error) {
          this.showError('خطا در تغییر وضعیت');
        } finally {
          this.statusLoading[unit.unitId] = false;
        }
      },
      newStatus ? 'success' : 'danger'
    );
  }



  refresh() {
    this.loadUnits();
    this.searchValue = '';
  }



}