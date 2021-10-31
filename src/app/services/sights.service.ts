import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

export type OknCategory = 'f' | 'r' | 'm' | 'v';

export type OknType = 'a' | 'g' | 'h' | 'i';

export type SightSet = 'main' | 'mus';

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
  filterParams: SightsFilterParams;
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

  public isFetsching$ = new Subject<boolean>();

  constructor(private http: HttpClient) {}

  public getSights(params: GetSightsParams): Observable<SightsData> {
    console.log('--- getSights params:', params);
    return this.fetchSights().pipe(
      map((sightsData) => this.filterSights(sightsData, params)),
    );
  }

  private fetchSights(): Observable<SightsData> {
    return new Observable<SightsData>((observer) => {
      if (this.sightsData.items.length) {
        observer.next(this.sightsData);
        observer.complete();
      } else {
        this.isFetsching$.next(true);

        this.http.get<SightData[]>('sights').subscribe(
          (resp) => {
            console.log('=== GET resp:', resp);
            this.sightsData.items = resp;
            this.isFetsching$.next(false);
            observer.next(this.sightsData);
            observer.complete();
          },
          (error) => {
            this.isFetsching$.next(false);
            observer.error(error);
          },
        );

        // setTimeout(() => {
        //   this.sightsData.items = [...SIGHTS_ITEMS];
        //   observer.next(this.sightsData);
        //   observer.complete();
        //   this.isFetsching$.next(false);
        // }, 1000);
      }
    });
  }

  private filterSights(
    sightsData: SightsData,
    params: GetSightsParams,
  ): SightsData {
    console.log('filterSights...');
    const { filterParams } = params;
    let items: SightData[] = [];

    Object.keys(filterParams).forEach((blockName) => {
      if (filterParams[blockName].switchedOn) {
        const { groups } = filterParams[blockName];
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

    console.log('--- filterSights items:', items);
    return { items };
  }

  public buildFilterParams(
    filterBlocks: FilterBlock[],
    formValue: any,
  ): SightsFilterParams {
    console.log('--- buildFilterParams formValue:', formValue);
    const filterParams: SightsFilterParams = {};

    filterBlocks.forEach((block) => {
      filterParams[block.name] = {
        switchedOn: formValue[block.name],
        opened: block?.opened ?? false,
        groups: Object.fromEntries(
          block.groups.map((group) => [group.name, formValue[group.name]]),
        ),
      };
    });

    return filterParams;
  }
}
