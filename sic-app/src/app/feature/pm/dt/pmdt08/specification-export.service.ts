// src/app/feature/pm/dt/pmdt08/specification-export.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { PmSpecificationModel } from './pmdt08.model';

@Injectable({
  providedIn: 'root',
})
export class SpecificationExportService {
  private http = inject(HttpClient);
  private apiBaseUrl = environment.apiBaseUrl;

  async exportSpecification(data: PmSpecificationModel, format: 'pdf' | 'docx' | 'html'): Promise<Blob> {
    const url = `${this.apiBaseUrl}/api/pm/specification/export`;

    const payload = {
      specificationId: data.id,
      format: format,
      data: data,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: format === 'pdf' ? 'application/pdf' : 
              format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
              'text/html',
    });

    try {
      const response = await lastValueFrom(
        this.http.post(url, payload, {
          headers: headers,
          responseType: 'blob',
        })
      );
      return response;
    } catch {
      // Fallback: client-side HTML printable blob if backend export endpoint is not implemented yet
      const htmlContent = this.generatePreviewHtml(data);
      return new Blob([htmlContent], { type: 'text/html' });
    }
  }

  generatePreviewHtml(data: PmSpecificationModel): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title || 'Specification'}</title>
  <style>
    body { font-family: 'Sarabun', Arial, sans-serif; max-width: 900px; margin: 2rem auto; padding: 2rem; line-height: 1.7; color: #1a1a2e; }
    h1 { font-size: 1.8rem; color: #1a1a2e; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.75rem; }
    h2 { font-size: 1.3rem; color: #1a1a2e; margin-top: 1.5rem; }
    .meta { display: flex; flex-wrap: wrap; gap: 1rem; color: #6b7280; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
    .badge-code { background: #e0f2fe; color: #0369a1; }
    .badge-status { background: #f3f4f6; color: #6b7280; }
    .badge-version { background: #f3f4f6; color: #6b7280; }
    .content { margin-top: 1.5rem; }
    .content h3 { margin-top: 1.25rem; color: #1a1a2e; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.25rem; }
    .content ul, .content ol { padding-left: 1.5rem; }
    .content img { max-width: 100%; border-radius: 0.5rem; }
    .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e7eb; font-size: 0.7rem; color: #9ca3af; display: flex; justify-content: space-between; }
  </style>
</head>
<body>
  <div class="badge badge-code">${data.specificationCode || 'N/A'}</div>
  <span class="badge badge-status">${data.status || 'Draft'}</span>
  <span class="badge badge-version">v${data.version || '1.0'}</span>
  
  <h1>${data.title || 'Untitled Specification'}</h1>
  
  <div class="meta">
    <span>👤 เจ้าของ: ${data.owner || data.createdBy || '-'}</span>
    <span>📅 สร้างเมื่อ: ${data.createdAt ? new Date(data.createdAt).toLocaleString('th-TH') : '-'}</span>
    <span>📁 โครงการ: ${data.projectName || '-'}</span>
    <span>🏷️ ประเภท: ${data.specificationType || data.specType || '-'}</span>
    <span>⏱️ Manday: ${data.estimatedManday || 0} วัน</span>
  </div>

  <div class="content">
    <h2>📝 รายละเอียด Specification</h2>
    ${data.description || '<p><em>ไม่มีรายละเอียด</em></p>'}
  </div>

  <div class="footer">
    <span>เอกสารนี้ใช้เพื่อการตรวจสอบและอนุมัติ Specification</span>
    <span>สร้างเมื่อ ${data.createdAt ? new Date(data.createdAt).toLocaleString('th-TH') : '-'}</span>
  </div>
</body>
</html>
    `;
  }
}
