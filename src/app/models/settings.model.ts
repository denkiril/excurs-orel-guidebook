import { SightsFilterParams } from './sights.models';

export interface SightsFilterParamsPreset {
  value: string;
  params: SightsFilterParams;
  paramsStr: string;
  seoTitle?: string;
  seoDescription?: string;
}
