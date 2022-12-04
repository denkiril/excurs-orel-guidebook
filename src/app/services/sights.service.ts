import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable, of, ReplaySubject, Subject, timer } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

import {
  SightsData,
  SightLink,
  SightForMoreData,
  UpdateActiveSightsData,
  SightData,
  SightDataExt,
  GetSightsParams,
} from '../models/sights.models';
import { SettingsService } from './settings.service';

interface SightByLink {
  slug: string;
  post_id: number;
  title: string;
}

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
  private sightForMoreId?: number;
  private nestedSights: { [key: number]: number[] } = {};
  private readonly sightsDataFetched$ = new ReplaySubject<void>();

  sightsData$ = new Subject<SightsData>(); // ReplaySubject (?)
  sightForMore$ = new Subject<SightForMoreData | undefined>();
  needUpdateActiveSights$ = new Subject<UpdateActiveSightsData>();

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
        delay: timer(400),
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

  getSightsIds(sightId: number): number[] {
    return this.nestedSights[sightId] || [sightId];
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

  private processActiveSights(
    addId: number | undefined,
    deleteId: number | undefined,
  ): void {
    this.sightsDataFetched$.pipe(first()).subscribe(() => {
      this.needUpdateActiveSights$.next({ addId, deleteId });
    });
  }
}
