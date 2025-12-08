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
  PIE = 'PIE',
  BAR = 'BAR',
  LINE = 'LINE',
  RADAR = 'RADAR',
  STACKED_BAR = 'STACKED_BAR',
}

export type SurveyDataKey = keyof SurveyDataset;
