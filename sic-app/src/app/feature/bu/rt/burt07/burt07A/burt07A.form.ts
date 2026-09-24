// src/app/feature/bu/rt/burt07/burt07A/burt07A.form.ts
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AiModelConfig } from '../burt07.model';

export class Burt07AForm {
  static createForm(fb: FormBuilder, model?: AiModelConfig | null): FormGroup {
    return fb.group({
      id: [model?.id || null],
      modelCode: [model?.modelCode || '', [Validators.required, Validators.maxLength(150)]],
      displayName: [model?.displayName || '', [Validators.required, Validators.maxLength(255)]],
      providerLabel: [model?.providerLabel || '', [Validators.required, Validators.maxLength(100)]],
      apiFormat: [model?.apiFormat || 'OPENAI_COMPATIBLE', [Validators.required]],
      apiUrl: [model?.apiUrl || '', [Validators.required, Validators.maxLength(500)]],
      // เว้นว่าง = ไม่เปลี่ยน key เดิม (ใช้ตอนแก้ไขเท่านั้น); สร้างใหม่ต้องกรอก
      apiKey: ['', model?.id ? [] : [Validators.required]],
      hasApiKey: [model?.hasApiKey ?? false],
      maxTokens: [model?.maxTokens ?? 4096, [Validators.required, Validators.min(1)]],
      description: [model?.description || ''],
      icon: [model?.icon || 'bi-robot'],
      isRecommended: [model?.isRecommended ?? (model as any)?.recommended ?? false],
      isDefault: [model?.isDefault ?? (model as any)?.default ?? false],
      isActive: [(model?.isActive ?? (model as any)?.active) !== false],
      rowVersion: [model?.rowVersion || null],
    });
  }
}
