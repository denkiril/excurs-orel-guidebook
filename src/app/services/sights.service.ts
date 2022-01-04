import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

export type OknCategory = 'f' | 'r' | 'm' | 'v';

export type OknType = 'a' | 'g' | 'h' | 'i';

export type SightSet = 'main' | 'mus';

export type District = '1' | '2' | '3';

export interface SightData {
  post_id: number;
  title: string;
  thumb_url: string;
  permalink: string;
  location?: string;
  category?: OknCategory[];
  type?: OknType[];
  sets?: SightSet[];
  okn_id?: string;
}

export type SightDataExt = SightData &
  Partial<{
    okn_title: string;
    okn_date: string;
    registry_date: string;
    district: District;
    districtStr: string;
    founding_date: string;
    site: string;
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
            title: 'Музеи',
            value: true,
          },
        ],
      },
    ],
  },
  {
    name: 'okn',
    title: 'ОКН',
    switchedOn: true,
    opened: false,
    showed: false,
    groups: [
      {
        name: 'category',
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
        name: 'type',
        title: 'Тип',
        controls: [
          {
            name: 'a',
            title: 'Памятник археологии',
            shortTitle: 'Арх.',
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
    ],
  },
];

// const SIGHTS_ITEMS: SightData[] = [
//   /* eslint-disable prettier/prettier */
//   { title: 'Здание банка ФА', category: ['fed'], type: ['aig'], sets: ['main'] },
//   { title: 'Гостиный дворъ ФИ', category: ['fed'], type: ['his'], sets: ['main'] },
//   { title: 'Дом купца РА', category: ['reg'], type: ['aig'], sets: ['main'] },
//   { title: 'Дом, где бывал РИ', category: ['reg'], type: ['his'], sets: ['main'] },
//   { title: 'Памятник кокой-то', category: ['mst'], type: ['art'] },
//   { title: 'Музей #1', sets: ['mus'] },
//   { title: 'Музей #2', sets: ['mus'] },
//   /* eslint-enable prettier/prettier */
// ];

@Injectable({
  providedIn: 'root',
})
export class SightsService {
  private sightsData: SightsData = {
    items: [],
  };

  public fetching$ = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  /* API methods */

  private fetchSights(): Observable<SightsData> {
    return new Observable<SightsData>((observer) => {
      if (this.sightsData.items.length) {
        observer.next(this.sightsData);
        observer.complete();
      } else {
        this.fetching$.next(true);

        this.http.get<SightData[]>('sights').subscribe(
          (resp) => {
            console.log('=== GET resp:', resp);
            this.sightsData.items = resp;
            this.fetching$.next(false);
            observer.next(this.sightsData);
            observer.complete();
          },
          (error) => {
            this.fetching$.next(false);
            observer.error(error);
          },
        );
      }
    });
  }

  public getSightById(id: number): Observable<SightDataExt> {
    console.log('getSightById...', id);
    // return this.fetchSights().pipe(
    //   delay(2000),
    //   map((sightsData) => sightsData.items[0]),
    // );
    return this.http.get<SightDataExt>(`sights/${id}`);
  }

  /* Other methods */

  public getSights(params: GetSightsParams): Observable<SightsData> {
    console.log('--- getSights params:', params);
    return this.fetchSights().pipe(
      map((sightsData) => this.filterSights(sightsData, params)),
    );
  }

  private filterSights(
    sightsData: SightsData,
    params: GetSightsParams,
  ): SightsData {
    console.log('filterSights...');
    const sightsFilterParams = params.filterParams.sightsFilterParams || {};
    let items: SightData[] = [];

    Object.keys(sightsFilterParams).forEach((blockName) => {
      if (sightsFilterParams[blockName].switchedOn) {
        const { groups } = sightsFilterParams[blockName];
        const groupNames = Object.keys(groups);

        items = items.concat(
          sightsData.items
            .filter((item) =>
              groupNames.every(
                (name) =>
                  (name === 'category' || name === 'type' || name === 'sets') &&
                  item[name]?.some((value: string) => groups[name][value]),
              ),
            )
            .slice(0, params.limit),
        );
      }
    });

    items = [...new Set(items)];

    if (params.filterParams.search) {
      const searchStr = params.filterParams.search.toLowerCase();
      items = items.filter((item) =>
        item.title.toLowerCase().includes(searchStr),
      );
    }

    console.log('--- filterSights items:', items);
    return { items };
  }
}
