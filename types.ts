export interface SimpleDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface ComparisonDataPoint {
  category: string;
  positive: number;
  negative: number;
  labelPositive: string;
  labelNegative: string;
}

export interface SurveyDataset {
  ageGroups: SimpleDataPoint[];
  zones: SimpleDataPoint[];
  transport: SimpleDataPoint[];
  frequency: SimpleDataPoint[];
  visitReason: SimpleDataPoint[];
  competitors: SimpleDataPoint[];
  choiceReason: SimpleDataPoint[];
  satisfaction: SimpleDataPoint[];
  preferredDepartment: SimpleDataPoint[];
  nameChangeAwareness: SimpleDataPoint[];
  experienceChanges: ComparisonDataPoint[];
}

export enum ChartType {
  PIE,
  BAR,
  LINE,
  RADAR,
  STACKED_BAR
}
