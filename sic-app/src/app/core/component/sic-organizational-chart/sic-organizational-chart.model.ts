export interface SicOrganizationalChartNode {
  id: string;
  nameEn: string;
  nameLocal: string;
  color: string;
  editable?: boolean;
  children: SicOrganizationalChartNode[];
}