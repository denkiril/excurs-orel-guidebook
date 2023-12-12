import { SightDataExt, SightsDataError } from '../../models/sights.models';

interface IdValue {
  id: string;
  value: string;
}

export interface MapPosition {
  coordinates: number[];
  type: string;
}

interface EgrknItemDocument {
  archive: { id: number; url: string };
  date: string;
  name: string;
  number: string;
}

interface AdditionalCoordinates {
  coordinates: number[][];
  type: string;
}

export interface EgrknItemGeneral {
  additionalCoordinates?: AdditionalCoordinates[];
  address: {
    fullAddress: string;
    mapPosition?: MapPosition;
  };
  categoryType: IdValue; // EGRKN_OKN_CATEGORIES
  createDate: string;
  documents: EgrknItemDocument[];
  id: number;
  isActual: boolean;
  name: string;
  objectType: IdValue;
  photo?: {
    url?: string;
    title?: string;
  };
  regNumber: string;
  region: IdValue;
  typologies: IdValue[]; // EGRKN_OKN_TYPES
}

export interface EgrknItemInfo {
  category: string;
  createDate: string;
  path: string;
}

export interface EgrknItemData {
  general: EgrknItemGeneral;
  info: EgrknItemInfo;
}

export interface EgrknItem {
  data: EgrknItemData;
  nativeId: string;
}

export interface EgrknResponse {
  data: EgrknItem[];
  count: number;
  total: number;
}

export interface EgrknSights {
  items: SightDataExt[];
  errors?: SightsDataError[];
}

export interface EgrknData {
  egrknUrl: string;
  photoUrl: string | undefined;
  // item: EgrknItem;
}
