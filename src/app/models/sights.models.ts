export type OknCategory = 'f' | 'r' | 'm' | 'v';

export type OknType = 'a' | 'g' | 'h' | 'i';

export type SightSet = 'main' | 'mus';

export type District = '1' | '2' | '3';

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
  meta: {
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

export interface SightData {
  post_id: number;
  title: string;
  thumb_url?: string;
  permalink: string;
  location?: string;
  okn_category?: OknCategory[];
  okn_type?: OknType[];
  sets?: SightSet[];
  okn_id?: string;
  geolocation?: { lat: string; lng: string };
  nested?: SightData[];
}

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
  sightForMore?: string;
}

export interface SightForMoreData {
  sight?: SightData;
  sightId?: number;
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

export const OKN_TYPES: { [key in OknType]: OknText } = {
  a: { short: 'Пам. археологии', full: 'Памятник археологии' },
  // eslint-disable-next-line prettier/prettier
  g: { short: 'Пам. архитект.', full: 'Памятник архитектуры и градостроительства'},
  h: { short: 'Пам. истории', full: 'Памятник истории' },
  i: { short: 'Пам. искусства', full: 'Памятник искусства' },
};

export const OKN_CATEGORIES: { [key in OknCategory]: OknText } = {
  f: { short: 'фед. зн.', full: 'Федерального значения' },
  r: { short: 'рег. зн.', full: 'Регионального значения' },
  m: { short: 'мест. зн.', full: 'Местного значения' },
  v: { short: '(выявл.)', full: 'Выявленный объект' },
};

export interface SightLink {
  link: string;
  sightId: number;
  title?: string;
}

export interface UpdateActiveSightsData {
  addId?: number;
  deleteId?: number;
}

export const FILTER_BLOCKS: FilterBlock[] = [
  {
    name: 'tur',
    title: 'Туристам',
    switchedOn: true,
    opened: false,
    showed: false,
    groups: [
      {
        name: 'sets',
        controls: [
          {
            name: 'main',
            title: 'Главные достопримечательности',
            value: true,
          },
          {
            name: 'mus',
            title: 'Государственные музеи',
            value: true,
          },
        ],
      },
    ],
  },
  {
    name: 'okn',
    title: 'Объекты культурного наследия',
    switchedOn: true,
    opened: false,
    showed: false,
    groups: [
      {
        name: 'okn_category',
        title: 'Категория охраны',
        shortTitle: 'Категория',
        controls: [
          {
            name: 'f',
            title: 'Федеральный',
            shortTitle: 'Фед.',
            value: true,
          },
          {
            name: 'r',
            title: 'Региональный',
            shortTitle: 'Рег.',
            value: false,
          },
          {
            name: 'm',
            title: 'Местный',
            shortTitle: 'Мест.',
            value: false,
          },
          {
            name: 'v',
            title: 'Выявленный',
            shortTitle: 'Выяв.',
            value: false,
          },
        ],
      },
      {
        name: 'okn_type',
        title: 'Тип',
        controls: [
          {
            name: 'a',
            title: 'Памятник археологии',
            shortTitle: 'Архео.',
            value: true,
          },
          {
            name: 'g',
            title: 'Памятник архитектуры и градостроительства',
            shortTitle: 'Архит.',
            value: true,
          },
          {
            name: 'h',
            title: 'Памятник истории',
            shortTitle: 'Истор.',
            value: true,
          },
          {
            name: 'i',
            title: 'Памятник искусства',
            shortTitle: 'Искус.',
            value: true,
          },
        ],
      },
      // {
      //   name: 'egrkn',
      //   title: 'Загрузить данные из госреестра',
      //   controls: [
      //     {
      //       name: 'go',
      //       title: 'Загрузить данные госреестра по Орлу',
      //       shortTitle: 'по Орлу',
      //       value: false,
      //       type: 'toggle',
      //     },
      //   ],
      // },
    ],
  },
];
