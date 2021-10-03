import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type OknCategory = 'fed' | 'reg' | 'mst' | 'vvl';

export type OknType = 'arc' | 'aig' | 'his' | 'art';

export interface SightData {
  // id: number;
  title: string;
  category?: OknCategory[];
  type?: OknType[];
  sets?: string[];
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
  title: string;
  shortTitle?: string;
  controls: FilterControl[];
}

export interface FilterBlock {
  name: string; // 'fb1' | 'fb2' | 'fb3' ?
  title: string;
  switchedOn: boolean;
  opened: boolean;
  showed: boolean;
  groups: FilterGroup[];
}

export const FILTER_BLOCKS: FilterBlock[] = [
  {
    name: 'fb1',
    title: 'Туристам',
    switchedOn: true,
    opened: false,
    showed: false,
    groups: [
      {
        name: 'sets',
        title: '',
        controls: [
          {
            name: 'main',
            title: 'Главные',
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
    name: 'fb2',
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
            name: 'fed',
            title: 'Федеральный',
            shortTitle: 'Фед.',
            value: true,
          },
          {
            name: 'reg',
            title: 'Региональный',
            shortTitle: 'Рег.',
            value: false,
          },
          {
            name: 'mst',
            title: 'Местный',
            shortTitle: 'Мест.',
            value: false,
          },
          {
            name: 'vvl',
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
            name: 'arc',
            title: 'Памятник археологии',
            shortTitle: 'Арх.',
            value: true,
          },
          {
            name: 'aig',
            title: 'Памятник архитектуры и градостроительства',
            shortTitle: 'Архит.',
            value: true,
          },
          {
            name: 'his',
            title: 'Памятник истории',
            shortTitle: 'Истор.',
            value: true,
          },
          {
            name: 'art',
            title: 'Памятник искусства',
            shortTitle: 'Искус.',
            value: true,
          },
        ],
      },
    ],
  },
];

@Injectable({
  providedIn: 'root',
})
export class SightsService {
  private sightsItems: SightData[] = [
    /* eslint-disable prettier/prettier */
    { title: 'Здание банка ФА', category: ['fed'], type: ['aig'], sets: ['main'] },
    { title: 'Гостиный дворъ ФИ', category: ['fed'], type: ['his'], sets: ['main'] },
    { title: 'Дом купца РА', category: ['reg'], type: ['aig'], sets: ['main'] },
    { title: 'Дом, где бывал РИ', category: ['reg'], type: ['his'], sets: ['main'] },
    { title: 'Памятник кокой-то', category: ['mst'], type: ['art'] },
    { title: 'Музей #1', sets: ['mus'] },
    { title: 'Музей #2', sets: ['mus'] },
    /* eslint-enable prettier/prettier */
  ];

  // public sightData: Subject<SightData[]> = new Subject<SightData[]>();

  public getSights(params: GetSightsParams): Observable<SightsData> {
    // TODO
    console.log('--- getSights params:', params);
    const { filterParams } = params;
    let items: SightData[] = [];

    Object.keys(filterParams).forEach((blockName) => {
      if (filterParams[blockName].switchedOn) {
        const { groups } = filterParams[blockName];
        const groupNames = Object.keys(groups);

        items = items.concat(
          this.sightsItems
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

    console.log('--- getSights items:', items);
    return of({ items });
  }
}
