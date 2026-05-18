export interface SicOrganizationalChartNode {
  id: string;
  name_en: string;
  name_local: string;
  color: string;
  editable?: boolean;
  children: SicOrganizationalChartNode[];
}
