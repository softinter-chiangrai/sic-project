// src/app/core/services/trace-link.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type TraceRelationshipType =
  | 'DESIGNED_BY'
  | 'IMPLEMENTED_BY'
  | 'DOCUMENTED_BY'
  | 'VERIFIED_BY'
  | 'FAILED_BY'
  | 'AFFECTED_BY'
  | 'RELATED_TO';

export interface TraceLink {
  id: string;
  projectId: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationshipType: TraceRelationshipType;
}

export interface CreateTraceLinkPayload {
  projectId: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  targetId: string;
  relationshipType: TraceRelationshipType;
}

// เลือกใช้ตอนสร้าง/แสดง dropdown ความสัมพันธ์
export const TRACE_RELATIONSHIP_OPTIONS: { value: TraceRelationshipType; label: string }[] = [
  { value: 'RELATED_TO', label: 'เกี่ยวข้องกับ (Related to)' },
  { value: 'DESIGNED_BY', label: 'ออกแบบจาก (Designed by)' },
  { value: 'IMPLEMENTED_BY', label: 'ถูกพัฒนาโดย (Implemented by)' },
  { value: 'DOCUMENTED_BY', label: 'ถูกบันทึกโดย (Documented by)' },
  { value: 'VERIFIED_BY', label: 'ถูกตรวจสอบโดย (Verified by)' },
  { value: 'FAILED_BY', label: 'ล้มเหลวจาก (Failed by)' },
  { value: 'AFFECTED_BY', label: 'ได้รับผลกระทบจาก (Affected by)' },
];

// relationshipType ที่บันทึกไว้เป็นมุมมองจากฝั่ง target เสมอ (target [relationshipType] source)
// fromTarget = คำที่ใช้ตอนแสดงจากฝั่ง target (ตรงกับความหมายเดิม), fromSource = คำกริยารูป active สำหรับฝั่ง source
export const TRACE_RELATIONSHIP_LABEL: Record<TraceRelationshipType, { fromTarget: string; fromSource: string }> = {
  DESIGNED_BY: { fromTarget: 'ออกแบบจาก', fromSource: 'ออกแบบให้กับ' },
  IMPLEMENTED_BY: { fromTarget: 'ถูกพัฒนาโดย', fromSource: 'พัฒนาให้กับ' },
  DOCUMENTED_BY: { fromTarget: 'ถูกบันทึกโดย', fromSource: 'บันทึกให้กับ' },
  VERIFIED_BY: { fromTarget: 'ถูกตรวจสอบโดย', fromSource: 'ตรวจสอบให้กับ' },
  FAILED_BY: { fromTarget: 'ล้มเหลวจาก', fromSource: 'ทำให้ล้มเหลว' },
  AFFECTED_BY: { fromTarget: 'ได้รับผลกระทบจาก', fromSource: 'ส่งผลกระทบต่อ' },
  RELATED_TO: { fromTarget: 'เกี่ยวข้องกับ', fromSource: 'เกี่ยวข้องกับ' },
};

@Injectable({ providedIn: 'root' })
export class TraceLinkService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/api/trace`;

  createLink(payload: CreateTraceLinkPayload): Observable<TraceLink> {
    return this.http.post<TraceLink>(`${this.base}/links`, payload);
  }

  getLinksBySource(sourceType: string, sourceId: string): Observable<TraceLink[]> {
    return this.http.get<TraceLink[]>(`${this.base}/links/source/${sourceType}/${sourceId}`);
  }

  getLinksByTarget(targetType: string, targetId: string): Observable<TraceLink[]> {
    return this.http.get<TraceLink[]>(`${this.base}/links/target/${targetType}/${targetId}`);
  }

  deleteLink(linkId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/links/${linkId}`);
  }
}
