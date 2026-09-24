// src/app/feature/bu/rt/burt07/burt07A/burt07A.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { SicButtonComponent, SicCardComponent, SicCheckboxComponent, SicInputComponent } from 'sic-ng';
import { SicComboboxComponent } from '../../../../../core/component/sic-combobox/sic-combobox.component';
import type { CanComponentDeactivate } from '../../../../../core/guard/can-deactivate.guard';
import { DialogService } from '../../../../../core/services/dialog.service';
import { Burt07AModel, Burt07APageData } from './burt07A.model';
import { AiModelConfig } from '../burt07.model';
import { Burt07Service } from '../burt07.service';
import { SicFromData } from '../../../../../core/model/sic-from-data';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-burt07a',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    SicButtonComponent,
    SicInputComponent,
    SicCheckboxComponent,
    SicCardComponent,
    SicComboboxComponent,
    TranslateModule,
  ],
  templateUrl: './burt07A.component.html',
  styleUrl: './burt07A.component.css',
  changeDetection: ChangeDetectionStrategy.Eager,
})
export class Burt07AComponent implements OnInit, CanComponentDeactivate {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(Burt07Service);
  private dialog = inject(DialogService);
  private translate = inject(TranslateService);

  readonly apiFormatOptions = computed(() => [
    { value: 'OPENAI_COMPATIBLE', text: this.translate.instant('BURT07A_APIFORMAT_OPENAI_COMPATIBLE') },
    { value: 'CLAUDE', text: this.translate.instant('BURT07A_APIFORMAT_CLAUDE') },
  ]);

  isEdit = false;
  modelId: string | null = null;
  isSaving = signal(false);

  formData!: SicFromData<Burt07AModel>;

  get form(): FormGroup {
    return this.formData.formGroup;
  }

  isSaved = false;
  pageDirty = () => (this.isSaved ? false : (this.formData?.isChanged ?? false));

  ngOnInit(): void {
    const page: Burt07APageData = this.route.snapshot.data['form'];
    this.formData = page.modelData;
    this.isEdit = page.isEdit;
    this.modelId = this.route.snapshot.paramMap.get('id');
  }

  cancel(): void {
    this.router.navigate(['/feature/bu/ai-model-config']);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.dialog.warn(this.translate.instant('BURT07A_FORM_INVALID_TITLE'), this.translate.instant('BURT07A_FORM_INVALID_MSG'));
      return;
    }

    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const data: Partial<AiModelConfig> = { ...raw };
    // ไม่ต้องส่ง apiKey ที่เว้นว่างไว้ตอนแก้ไข (backend จะตีความว่า "ไม่เปลี่ยน key เดิม")
    if (!data.apiKey) {
      delete data.apiKey;
    }

    this.service.saveModel(data)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: () => {
          this.isSaved = true;
          this.form.markAsPristine();
          this.dialog.success(this.translate.instant('BURT07A_SAVE_SUCCESS_TITLE'), this.translate.instant('BURT07A_SAVE_SUCCESS_MSG', { name: raw.displayName }));
          this.router.navigate(['/feature/bu/ai-model-config']);
        },
        error: (err) => {
          this.dialog.error(this.translate.instant('BURT07A_SAVE_FAILED_TITLE'), err.error?.message || this.translate.instant('BURT07A_GENERIC_ERROR_MSG'));
        },
      });
  }
}
