import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SettingsService } from './settings.service';

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

interface SightByLink {
  slug: string;
  post_id: number;
  title: string;
}

export interface SightLink {
  link: string;
  sightId: number;
  title?: string;
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

  private sightLinks: SightLink[] = [];
  private activeSights = new Set<number>();
  private sightForMoreId?: number;

  fetching$ = new Subject<boolean>();
  sightsData$ = new ReplaySubject<SightsData>();
  activeSights$ = new ReplaySubject<number[]>();
  sightForMore$ = new Subject<SightForMoreData | undefined>();

  constructor(
    private http: HttpClient,
    private settingsService: SettingsService,
  ) {}

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
      tap((filtSightsData) => this.sightsData$.next(filtSightsData)),
    );
  }

  private filterSights(
    sightsData: SightsData,
    params: GetSightsParams,
  ): SightsData {
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
                  (name === 'okn_category' ||
                    name === 'okn_type' ||
                    name === 'sets') &&
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

    return { items };
  }

  public getSightLinks(links: string[]): Observable<SightLink[]> {
    const addSlash = (str: string): string => {
      return str[str.length - 1] === '/' ? str : `${str}/`;
    };

    const gbPrefix = 'guidebook/';
    const slugs: string[] = [];
    links.forEach((str) => {
      const link = str.includes(gbPrefix) ? addSlash(str) : null;
      if (link && !this.sightLinks.some((item) => item.link === link)) {
        slugs.push(link.replace(gbPrefix, '').replace(/\//g, ''));
      }
    });

    return slugs.length
      ? this.http
          .get<SightByLink[]>('sight-links', {
            params: { slugs: slugs.join(',') },
          })
          .pipe(
            tap((sights) => {
              const sightLinks: SightLink[] = sights.map((item) => ({
                link: `/${gbPrefix}${item.slug}/`,
                sightId: item.post_id,
                title: item.title,
              }));

              this.sightLinks = this.sightLinks.concat(sightLinks);
            }),
            map(() => this.sightLinks),
          )
      : of(this.sightLinks);
  }

  public addActiveSight(sightId: number): void {
    this.activeSights.add(sightId);
    this.emitActiveSights();
  }

  public deleteActiveSight(sightId: number): void {
    if (sightId !== this.sightForMoreId) {
      console.log('deleteActiveSight:', sightId);
      this.activeSights.delete(sightId);
      this.emitActiveSights();
    }
  }

  private emitActiveSights(): void {
    this.activeSights$.next(Array.from(this.activeSights));
  }

  public setSightForMore(
    sight?: SightData,
    sightId?: number,
    setQP = true,
  ): void {
    const sightForMore = sight || sightId ? { sight, sightId } : undefined;
    const sightForMoreId = sightForMore
      ? sightForMore.sight?.post_id || sightForMore.sightId
      : undefined;
    console.log('setSightForMore:', sightForMoreId);

    if (this.sightForMoreId) this.activeSights.delete(this.sightForMoreId);
    if (sightForMoreId) this.activeSights.add(sightForMoreId);
    if (this.sightForMoreId || sightForMoreId) this.emitActiveSights();
    this.sightForMoreId = sightForMoreId;

    this.sightForMore$.next(sightForMore);

    if (setQP) {
      this.settingsService.setQueryParam('sight', this.sightForMoreId);
    }
  }
}
