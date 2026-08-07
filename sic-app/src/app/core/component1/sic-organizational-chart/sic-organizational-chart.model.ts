// src/app/core/component/sic-organizational-chart/sic-organizational-chart.model.ts
export interface SicOrganizationalChartNode {
  id: string;
  roleCode?: string;        // ✅ เพิ่ม
  nameEn: string;
  nameLocal: string;
  color: string;
  editable?: boolean;
  children: SicOrganizationalChartNode[];
  // ฟิลด์เสริม (optional)
  _roleCode?: string;
  _sortOrder?: number;
  _roleLevel?: string;
}