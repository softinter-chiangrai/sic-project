import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ChangeDetectionStrategy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { DialogService } from '../../services/dialog.service';
import {
  SicButtonComponent,
  SicComboboxComponent,
  SicInputAreaComponent,
  SicInputComponent,
} from 'sic-ng';

// ใช้ type ช่วยให้โค้ดอ่านง่ายขึ้น
interface ComboboxSearchEvent {
  keyword?: string;
  value?: any;
  pageNo: number;
  pageSize: number;
  options: {
    update: (items: any[]) => void;
  };
}

@Component({
  selector: 'sic-change-request-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SicInputComponent,
    SicInputAreaComponent,
    SicButtonComponent,
    SicComboboxComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div
      class="w-[min(92vw,32rem)] overflow-hidden rounded-2xl border bg-[var(--bg)] text-[var(--text)] shadow-2xl"
    >
      <div class="border-b px-5 py-4" style="border-color: var(--border);">
        <h3 class="text-base font-semibold text-[var(--text-active)]">
          Create Change Request
        </h3>
        <p class="text-sm text-[var(--text-muted)]">
          This document is approved. You need a Change Request to edit.
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 px-5 py-4">
        <!-- Title -->
        <sic-input
          label="Title"
          formControlName="title"
          [required]="true"
        ></sic-input>

        <!-- Description -->
        <sic-input-area
          label="Description"
          formControlName="description"
          [rows]="3"
        ></sic-input-area>

        <!-- Change Reason – ใช้ (search) + isPaging แทน apiUrl -->
        <sic-combobox
          label="Change Reason"
          formControlName="changeReason"
          [isPaging]="true"
          [pageSize]="10"
          optionLabel="text"
          optionValue="value"
          placeholder="ค้นหาหรือเลือกสาเหตุ..."
          (search)="loadChangeReasons($event)"
        ></sic-combobox>

        <!-- Assignee – ใช้ (search) + isPaging แทน apiUrl -->
        <sic-combobox
          label="Assignee"
          formControlName="assigneeId"
          [isPaging]="true"
          [pageSize]="10"
          optionLabel="text"
          optionValue="value"
          placeholder="ค้นหาหรือเลือกผู้รับผิดชอบ..."
          [required]="true"
          (search)="loadAssignees($event)"
        ></sic-combobox>

        <!-- Actions -->
        <div
          class="flex justify-end gap-2 border-t pt-4"
          style="border-color: var(--border);"
        >
          <sic-button
            variant="outline"
            size="sm"
            (click)="cancel()"
          >
            Cancel
          </sic-button>
          <sic-button
            variant="solid"
            color="primary"
            size="sm"
            type="submit"
            [disabled]="form.invalid"
          >
            Create & Submit
          </sic-button>
        </div>
      </form>
    </div>
  `,
})
export class SicChangeRequestDialogComponent implements OnInit {
  @Input() targetType!: string;
  @Input() targetId!: string;
  @Input() businessId!: string;
  @Output() created = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private dialogService = inject(DialogService);
  private http = inject(HttpClient);

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    changeReason: [''],
    assigneeId: ['', Validators.required],
  });

  ngOnInit(): void {
    // ไม่ต้องโหลดอะไรเพิ่ม เพราะ sic-combobox ที่มี isPaging=true
    // จะเรียก (search) อัตโนมัติเมื่อเปิด dropdown ครั้งแรก (pageNo = 1)
    // ถ้าอยากให้โหลดข้อมูลไว้ล่วงหน้าก่อนเปิด dropdown ก็สามารถเรียก method เหล่านี้
    // ด้วยการจำลอง event ก็ได้ แต่ไม่จำเป็น
  }

  // ============================================
  // 1. โหลด Change Reason (จาก LOV)
  // ============================================
  loadChangeReasons(event: ComboboxSearchEvent): void {
    // สร้าง URL พร้อม query parameters
    let url =
      '/api/db/parameter/lov?group=PM&parameterCode=CHANGE_REASON';

    // ถ้ามี keyword ให้เพิ่มเข้าไป (ถ้า API รองรับ)
    if (event.keyword) {
      url += `&keyword=${encodeURIComponent(event.keyword)}`;
    }

    // ถ้า API รองรับ pagination ก็ส่ง pageNo / pageSize ไปด้วย
    // (API จริงอาจไม่รองรับ LOV paging แต่เราส่งไปให้เผื่อไว้)
    url += `&pageNumber=${event.pageNo}&pageSize=${event.pageSize}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        // แปลงข้อมูลให้อยู่ในรูปแบบ { value, text }
        const items = data.map((item) => ({
          value: item.value ?? item.id,
          text: item.text ?? item.name,
        }));
        // ส่งกลับไปที่ combobox
        event.options.update(items);
      },
      error: () => {
        event.options.update([]);
      },
    });
  }

  // ============================================
  // 2. โหลด Assignee (จาก combobox-members)
  // ============================================
  loadAssignees(event: ComboboxSearchEvent): void {
    // ใช้ businessId ที่รับมาจาก @Input
    let url = `/api/business/combobox-members?businessId=${this.businessId}`;

    if (event.keyword) {
      url += `&keyword=${encodeURIComponent(event.keyword)}`;
    }

    // ส่ง pageNo / pageSize ให้ API (ถ้ารองรับ)
    url += `&pageNumber=${event.pageNo}&pageSize=${event.pageSize}`;

    this.http.get<any[]>(url).subscribe({
      next: (data) => {
        const items = data.map((item) => ({
          value: item.value ?? item.id,
          text: item.text ?? item.name,
        }));
        event.options.update(items);
      },
      error: () => {
        event.options.update([]);
      },
    });
  }

  // ============================================
  // 3. Submit / Cancel
  // ============================================
  submit(): void {
    if (this.form.invalid) return;

    const data = {
      ...this.form.value,
      targetType: this.targetType,
      targetId: this.targetId,
    };

    this.created.emit(data);
    this.dialogService.close(true);
  }

  cancel(): void {
    this.dialogService.close(false);
  }
}