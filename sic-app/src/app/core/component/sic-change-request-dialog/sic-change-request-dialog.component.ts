import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SicInputComponent } from '../sic-input/sic-input.component';
import { SicTiptapEditorComponent } from '../sic-tiptap-editor/sic-tiptap-editor.component';
import { SicButtonComponent } from '../sic-button/sic-button.component';
import { SicComboboxComponent } from '../sic-combobox/sic-combobox.component';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'sic-change-request-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SicInputComponent, SicTiptapEditorComponent, SicButtonComponent, SicComboboxComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="w-[min(92vw,36rem)] overflow-hidden rounded-2xl border bg-[var(--bg)] text-[var(--text)] shadow-2xl">
      <div class="border-b px-5 py-4" style="border-color: var(--border);">
        <h3 class="text-base font-semibold text-[var(--text-active)]">Create Change Request</h3>
        <p class="text-sm text-[var(--text-muted)]">This document is approved. You need a Change Request to edit.</p>
      </div>
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-4 px-5 py-4">
        <sic-input label="Title" formControlName="title" [required]="true"></sic-input>
        <sic-tiptap-editor label="Description" formControlName="description" minHeight="120px"></sic-tiptap-editor>
        <sic-combobox label="Change Reason" formControlName="changeReason" [apiUrl]="'/api/db/parameter/lov?group=PM&parameterCode=CHANGE_REASON'" valueField="value" textField="text"></sic-combobox>
        <sic-combobox label="Assignee" formControlName="assigneeId" [apiUrl]="'/api/business/combobox-members?businessId=' + businessId" valueField="value" textField="text" [required]="true"></sic-combobox>
        <div class="flex justify-end gap-2 border-t pt-4" style="border-color: var(--border);">
          <sic-button variant="secondary" size="sm" (click)="cancel()">Cancel</sic-button>
          <sic-button variant="primary" size="sm" type="submit" [disabled]="form.invalid">Create & Submit</sic-button>
        </div>
      </form>
    </div>
  `
})
export class SicChangeRequestDialogComponent {
  @Input() targetType!: string;
  @Input() targetId!: string;
  @Input() businessId!: string;
  @Output() created = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private dialogService = inject(DialogService);

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    changeReason: [''],
    assigneeId: ['', Validators.required]
  });

  submit() {
    if (this.form.invalid) return;
    const data = {
      ...this.form.value,
      targetType: this.targetType,
      targetId: this.targetId
    };
    this.created.emit(data);
    this.dialogService.close(true);
  }

  cancel() {
    this.dialogService.close(false);
  }
}