import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { delay, first, map, tap } from 'rxjs/operators';
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
  // type?: 'toggle';
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

const SIGHTS_WITH_NESTED = [
  {
    postId: 905,
    nested: [1044],
  },
  {
    postId: 924,
    nested: [1043],
  },
  {
    postId: 938,
    nested: [1022],
  },
];

@Injectable({
  providedIn: 'root',
})
export class SightsService {
  private sightsData: SightsData = {
    items: [],
  };

  private sightLinks: SightLink[] = [];
  private activeSights: number[] = [];
  private sightForMoreId?: number;
  private nestedSights: { [key: number]: number[] } = {};
  private readonly sightsDataFetched$ = new ReplaySubject<void>();

  sightsData$ = new Subject<SightsData>(); // ReplaySubject (?)
  activeSights$ = new ReplaySubject<number[]>();
  sightForMore$ = new Subject<SightForMoreData | undefined>();

  constructor(
    private readonly http: HttpClient,
    private readonly settingsService: SettingsService,
  ) {}

  /* API methods */

  private fetchSights(): Observable<SightsData> {
    return new Observable<SightsData>((observer) => {
      if (this.sightsData.items.length) {
        observer.next(this.sightsData);
        observer.complete();
      } else {
        this.http.get<SightData[]>('sights').subscribe(
          (resp) => {
            console.log('=== GET resp:', resp);
            this.sightsData.items = resp;
            observer.next(this.sightsData);
            observer.complete();
          },
          (error) => {
            observer.error(error);
            observer.complete();
          },
        );
      }
    });
  }

  private fetchingSights(): Observable<SightsData> {
    return new Observable<SightsData>((observer) => {
      forkJoin({
        sightsData: this.fetchSights(),
        delay: of(undefined).pipe(delay(400)),
      }).subscribe(
        (resp) => {
          observer.next(resp.sightsData);
          observer.complete();
        },
        (error) => {
          observer.error(error);
          observer.complete();
        },
      );
    });
  }

  getSightById(id: number): Observable<SightDataExt> {
    // console.log('getSightById...', id);
    // return this.fetchSights().pipe(
    //   delay(2000),
    //   map((sightsData) => sightsData.items[0]),
    // );
    return this.http.get<SightDataExt>(`sights/${id}`);
  }

  /* Other methods */

  getSights(params: GetSightsParams): Observable<SightsData> {
    // console.log('--- getSights params:', params);
    return this.fetchingSights().pipe(
      map((sightsData) => this.filterSights(sightsData, params)),
      tap((filtSightsData) => {
        this.sightsData$.next(filtSightsData);
        this.sightsDataFetched$.next();
      }),
    );
  }

  private filterSights(
    sightsData: SightsData,
    params: GetSightsParams,
  ): SightsData {
    const sightsFilterParams = params.filterParams.sightsFilterParams || {};
    // console.log('filterSights sightsFilterParams:', sightsFilterParams);
    let items: SightData[] = [];

    Object.keys(sightsFilterParams).forEach((blockName) => {
      if (sightsFilterParams[blockName].switchedOn) {
        // console.log('switchedOn:', blockName);
        const { groups } = sightsFilterParams[blockName];
        // const groupNames = Object.keys(groups);
        // console.log('groups:', groups);

        items = items.concat(
          sightsData.items
            .filter((item) => {
              if (blockName === 'okn') {
                return (
                  item.okn_category?.some(
                    (value) => groups.okn_category[value],
                  ) && item.okn_type?.some((value) => groups.okn_type[value])
                );
              }
              return item.sets?.some((value) => groups.sets[value]);
              // return groupNames.every(
              //   (name) =>
              //     (name === 'okn_category' ||
              //       name === 'okn_type' ||
              //       name === 'sets') &&
              //     item[name]?.some((value: string) => groups[name][value]),
              // );
            })
            .slice(0, params.limit),
        );
      }
    });

    items = [...new Set(items)];

    // Filter by search
    if (params.filterParams.search) {
      const searchStr = params.filterParams.search.toLowerCase();
      items = items.filter((item) =>
        item.title.toLowerCase().includes(searchStr),
      );
    }

    // Filter nested
    this.nestedSights = {};
    const allNested: SightData[] = [];
    SIGHTS_WITH_NESTED.forEach((swn) => {
      const holder = items.find((item) => item.post_id === swn.postId);
      if (holder) {
        const nestedItems = items.filter((item) =>
          swn.nested.includes(item.post_id),
        );
        if (nestedItems.length) {
          holder.nested = nestedItems;
          allNested.push(...nestedItems);
          nestedItems.forEach((nestedItem) => {
            const id = nestedItem.post_id;
            const holdersIds = this.nestedSights[id] || [];
            holdersIds.push(holder.post_id);
            this.nestedSights[id] = holdersIds;
          });
        }
      }
    });

    if (allNested.length) {
      const nestedIds = new Set<number>(allNested.map((item) => item.post_id));
      items = items.filter((item) => !nestedIds.has(item.post_id));
    }

    // Sort
    const mainItems = items.filter(
      (item) => item.sets?.length && item.sets[0] === 'main',
    );
    const musItems = items.filter(
      (item) => item.sets?.length && item.sets[0] === 'mus',
    );
    items = [...mainItems, ...musItems];

    // console.log('filterSights items:', items);
    return { items };
  }

  getSightLinks(links: string[]): Observable<SightLink[]> {
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

  addActiveSight(sightId: number): void {
    // console.log('addActiveSight', sightId);
    this.activeSightsAdd(sightId);
    this.emitActiveSights();
  }

  deleteActiveSight(sightId: number): void {
    // console.log('deleteActiveSight', sightId);
    this.activeSightsDelete(sightId);
    this.emitActiveSights();
  }

  deleteAllActiveSights(): void {
    this.activeSights = [];
    this.emitActiveSights();
  }

  private activeSightsAdd(sightId: number): void {
    const ids = this.nestedSights[sightId] || [sightId];
    this.activeSights.push(...ids);
  }

  private activeSightsDelete(sightId: number): void {
    const ids = this.nestedSights[sightId] || [sightId];
    ids.forEach((id) => {
      const index = this.activeSights.indexOf(id);
      if (index > -1) this.activeSights.splice(index, 1);
    });
  }

  private emitActiveSights(): void {
    // console.log('-- emitActiveSights', this.activeSights);
    this.activeSights$.next(Array.from(new Set(this.activeSights)));
  }

  private processActiveSights(
    addId: number | undefined,
    deleteId: number | undefined,
  ): void {
    // console.log('processActiveSights...');
    this.sightsDataFetched$.pipe(first()).subscribe(() => {
      // console.log('processActiveSights | addId, deleteId:', addId, deleteId);
      if (addId) this.activeSightsAdd(addId);
      if (deleteId) this.activeSightsDelete(deleteId);
      if (addId || deleteId) this.emitActiveSights();
    });
  }

  setSightForMore(sightData?: SightData, sightId?: number, setQP = true): void {
    // console.log('setSightForMore', sightData, sightId, setQP);
    const sight =
      !sightData && sightId
        ? this.sightsData.items.find((item) => item.post_id === sightId)
        : undefined;
    const sightForMore = sight || sightId ? { sight, sightId } : undefined;
    const sightForMoreId = sightForMore
      ? sightForMore.sight?.post_id || sightForMore.sightId
      : undefined;

    this.processActiveSights(sightForMoreId, this.sightForMoreId);
    this.sightForMoreId = sightForMoreId;

    if (setQP) {
      this.settingsService.setQueryParam('sight', this.sightForMoreId);
    } else {
      this.sightForMore$.next(sightForMore);
    }
  }
}
