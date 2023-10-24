import { EgrknData } from '../features/egrkn/egrkn.model';

export type OknCategory = 'f' | 'r' | 'm' | 'v';

export type OknType = 'a' | 'g' | 'h' | 'i';

export type SightSet = 'main' | 'mus';

export type District = '1' | '2' | '3';

export type SightsDataError = string; // 'FETCH_SIGHTS_ERROR' | 'FETCH_EGRKN_ERROR';

export type SightId = string;

export interface ImageSizeItem {
  file: string;
  height: number;
  width: number;
  'mime-type'?: string;
}

export interface ImageItem {
  alt: string;
  caption: string;
  title: string;
  full: string;
  meta?: {
    file: string;
    height: number;
    width: number;
    sizes: {
      large: ImageSizeItem;
      medium: ImageSizeItem;
      medium_large: ImageSizeItem;
      thumbnail: ImageSizeItem;
    };
  };
}

export interface SightGeolocation {
  lat: string;
  lng: string;
}

export interface SightResponseItem {
  post_id: number;
  title: string;
  thumb_url?: string;
  permalink?: string;
  location?: string;
  okn_category?: OknCategory[];
  okn_type?: OknType[];
  sets?: SightSet[];
  okn_id?: string;
  geolocation?: SightGeolocation;
}

export interface SightResponseItemExt extends SightResponseItem {
  okn_title: string;
  okn_date: string;
  registry_date: string;
  district: District;
  founding_date: string;
  site: string;
  images: ImageItem[];
  gba_intro: string;
  gba_content: string;
}

export interface SightData {
  id: SightId;
  type: SightType;
  title: string;
  thumb_url?: string;
  permalink?: string;
  location?: string;
  okn_category?: OknCategory[];
  okn_type?: OknType[];
  sets?: SightSet[];
  okn_id?: string;
  geolocation?: SightGeolocation;
  nested?: SightData[];
  // EGRKN
  egrknData?: EgrknData;
}

// TODO Add true API interfaces, no "id" in exo response!
export type SightDataExt = SightData &
  Partial<{
    okn_title: string;
    okn_date: string;
    registry_date: string;
    district: District;
    founding_date: string;
    site: string;
    // thumb_image?: ImageItem;
    images: ImageItem[];
    gba_intro: string;
    gba_content: string;
  }>;

export interface SightsData {
  items: SightData[];
  errors?: SightsDataError[];
}

export interface SightsFilterParams {
  [key: string]: {
    switchedOn?: boolean;
    opened?: boolean;
    groups: Record<string, Record<string, boolean>>;
  };
}

export interface GetSightsParams {
  limit?: number;
  filterParams: FilterParams;
}

export interface FilterParams {
  sightsFilterParams?: SightsFilterParams;
  search?: string;
  sightForMore?: SightId;
}

interface FilterControl {
  name: string;
  title: string;
  shortTitle?: string;
  value: boolean;
  type?: 'toggle';
}

interface FilterGroup {
  name: string;
  title?: string;
  shortTitle?: string;
  controls: FilterControl[];
}

export interface FilterBlock {
  name: string;
  title: string;
  switchedOn: boolean;
  opened: boolean;
  showed: boolean;
  groups: FilterGroup[];
}

export interface OknText {
  short: string;
  full: string;
}

export interface SightLink {
  link: string;
  sightId: SightId;
  title?: string;
}

export interface SightWithNested {
  sightId: SightId;
  nested: SightId[];
}

export enum SightType {
  DEFAULT = 'exo_',
  EGRKN = 'egrkn_',
}
