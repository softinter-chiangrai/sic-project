// src/app/feature/pm/dt/pmdt05/requirement-export.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, lastValueFrom } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { RequirementModel } from './pmdt04A.model';

@Injectable({
  providedIn: 'root',
})
export class RequirementExportService {
  private http = inject(HttpClient);
  private apiBaseUrl = environment.apiBaseUrl;


  async exportRequirement(data: RequirementModel, format: 'pdf' | 'docx' | 'html'): Promise<Blob> {
    // POST /api/pm/requirement/export
    const url = `${this.apiBaseUrl}/api/pm/requirement/export`;

    const payload = {
      requirementId: data.id,
      format: format,
      data: data,
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: format === 'pdf' ? 'application/pdf' : 
              format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' :
              'text/html',
    });

    const response = await lastValueFrom(
      this.http.post(url, payload, {
        headers: headers,
        responseType: 'blob',
      })
    );

    return response;
  }

  /**
   * Export using JasperReports (if backend supports)
   */
  async exportWithJasper(requirementId: string, format: 'pdf' | 'docx' | 'html'): Promise<Blob> {
    // GET /api/pm/requirement/{id}/export?format=pdf
    const url = `${this.apiBaseUrl}/api/pm/requirement/${requirementId}/export?format=${format}`;
    
    const response = await lastValueFrom(
      this.http.get(url, {
        responseType: 'blob',
      })
    );

    return response;
  }

  /**
   * Generate a preview HTML string from requirement data
   */
  generatePreviewHtml(data: RequirementModel): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${data.title || 'Requirement'}</title>
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
    .priority-must { color: #dc2626; font-weight: 700; }
    .priority-should { color: #f59e0b; font-weight: 600; }
    .priority-could { color: #3b82f6; font-weight: 500; }
    .priority-wont { color: #6b7280; }
  </style>
</head>
<body>
  <div class="badge badge-code">${data.requirementCode || 'N/A'}</div>
  <span class="badge badge-status">${data.status || 'Draft'}</span>
  <span class="badge badge-version">${data.version ? (data.version.startsWith('v') || data.version.startsWith('V') ? data.version : 'v' + data.version) : 'v0.1'}</span>
  
  <h1>${data.title || 'Untitled Requirement'}</h1>
  
  <div class="meta">
    <span>👤 ${data.createdBy || '-'}</span>
    <span>📅 ${data.createdAt ? new Date(data.createdAt).toLocaleString('th-TH') : '-'}</span>
    <span>📁 ${data.projectName || '-'}</span>
    <span class="priority-${(data.priority || 'must').toLowerCase()}">${data.priority || 'Must'}</span>
  </div>

  <div class="content">
    ${data.description || '<p><em>ไม่มีรายละเอียด</em></p>'}
    
    ${data.acceptanceCriteria ? `
      <h2>✅ เงื่อนไขการยอมรับ</h2>
      ${data.acceptanceCriteria}
    ` : ''}
  </div>

  <div class="footer">
    <span>เอกสารนี้ใช้เพื่อการตรวจสอบและอนุมัติ</span>
    <span>สร้างเมื่อ ${data.createdAt ? new Date(data.createdAt).toLocaleString('th-TH') : '-'}</span>
  </div>
</body>
</html>
    `;
  }
}