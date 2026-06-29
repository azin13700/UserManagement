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
    ConfirmDialogModule
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

  // ====== داده‌ها ======
  units: Unit[] = [];
  treeData: TreeNode[] = [];
  filteredTreeData: TreeNode[] = [];
  loading = false;
  searchValue = '';


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
      if (result) this.loadUnits();
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
      if (result) this.loadUnits();
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
      if (result) this.loadUnits();
    });
  }


  toggleStatus(unit: Unit) {
    const newStatus = !unit.isActive;
    const action = newStatus ? 'فعال' : 'غیرفعال';
    
    this.confirmationService.confirm({
      message: `آیا از ${action} کردن واحد "${unit.name}" مطمئن هستید؟`,
      header: 'تأیید تغییر وضعیت',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.statusLoading[unit.unitId] = true;
        this.api.ToggleUnitStatus(unit.unitId).subscribe({
          next: () => {
            unit.isActive = newStatus;
            this.showSuccess(`واحد با موفقیت ${action} شد`);
            this.statusLoading[unit.unitId] = false;
          },
          error: () => {
            this.showError('خطا در تغییر وضعیت');
            this.statusLoading[unit.unitId] = false;
          }
        });
      }
    });
  }


  refresh() {
    this.loadUnits();
    this.searchValue = '';
  }


  showSuccess(msg: string) {
    this.messageService.add({ severity: 'success', summary: 'موفق', detail: msg, life: 3000 });
  }

  showError(msg: string) {
    this.messageService.add({ severity: 'error', summary: 'خطا', detail: msg, life: 3000 });
  }
}