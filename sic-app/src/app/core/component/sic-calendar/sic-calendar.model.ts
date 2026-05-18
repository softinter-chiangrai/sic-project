export interface SicCalendarTask {
  id: string;
  title: string;
  date: string;
  description?: string;
  color?: string;
  completed?: boolean;
}