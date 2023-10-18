import { Injectable, TransferState, makeStateKey } from '@angular/core';
import { forkJoin, Observable, of, ReplaySubject, Subject, timer } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

import {
  SightsData,
  SightLink,
  SightData,
  SightDataExt,
  GetSightsParams,
  SightsDataError,
  SightResponseItem,
  SightId,
  SightType,
  SightResponseItemExt,
} from '../models/sights.models';
import { RequestService } from './request.service';
import { EgrknService } from '../features/egrkn/services/egrkn.service';
import { FilterParamsStoreService } from '../store/filter-params-store.service';
import { SettingsService } from './settings.service';
import { SIGHTS_WITH_NESTED } from '../models/sights.constants';
import { LoggerService } from './logger.service';

const SIGHTS_STATE_KEY = makeStateKey<SightResponseItem[]>('sights');

interface SightByLink {
  slug: string;
  post_id: number;
  title: string;
}

interface ExtSightsData {
  items: SightData[];
  errors?: SightsDataError[];
}

// TODO
// refac setSightForMore/redirectToSightForMore etc. - route-driven state

@Injectable({
  providedIn: 'root',
})
export class SightsService {
  private sightsData: SightsData = {
    items: [],
  };

  private sightLinks: SightLink[] = [];
  private nestedSights: { [key: string]: string[] } = {};

  private readonly fetchingSightsSubject = new ReplaySubject<SightsData>();
  private readonly sightsDataSubject = new Subject<SightsData>(); // ReplaySubject (?)
  readonly sightsData$ = this.sightsDataSubject.asObservable();

  constructor(
    private readonly transferState: TransferState,
    private readonly loggerService: LoggerService,
    private readonly egrknService: EgrknService,
    private readonly filterParamsStore: FilterParamsStoreService,
    private readonly requestService: RequestService,
    private readonly settingsService: SettingsService,
  ) {}

  /* API methods */

  private fetchSights$(): Observable<SightsData> {
    this.loggerService.log('// fetchSights...', this.sightsData.items.length);

    if (this.sightsData.items.length) {
      this.sightsData.items = this.sightsData.items.map((item) => ({
        ...item,
        nested: undefined,
      }));
      return of(this.sightsData);
    }

    return this.requestSights$().pipe(
      tap((items) => {
        this.sightsData.items = items.map((item) => this.prepareExoSight(item));
        // console.log('// fetchSights TAP', this.sightsData.items.length);
      }),
      map(() => this.sightsData),
      catchError(() => of({ items: [], errors: ['FETCH_SIGHTS_ERROR'] })),
    );
  }

  private requestSights$(): Observable<SightResponseItem[]> {
    const transfered = this.transferState.get(SIGHTS_STATE_KEY, []);

    return transfered.length
      ? of(transfered)
      : this.requestService.getApi<SightResponseItem[]>('sights').pipe(
          tap((sights) => {
            this.transferState.set(SIGHTS_STATE_KEY, sights);
          }),
        );
    // return this.requestService.getApi<SightResponseItem[]>('sights');
  }

  private prepareExoSight(item: SightResponseItem): SightData {
    return {
      ...item,
      id: this.prepareSightId(item.post_id, SightType.DEFAULT),
      type: SightType.DEFAULT,
    };
  }

  private fetchingSights$(withDelay?: boolean): Observable<ExtSightsData> {
    // console.log('fetchingSights...');
    return new Observable<ExtSightsData>((observer) => {
      forkJoin({
        sightsData: this.fetchSights$(),
        egrknData: this.egrknService.getEgrknSights$(this.needEgrkn()),
        delay: timer(withDelay ? 300 : 0),
      }).subscribe({
        next: ({ sightsData, egrknData }) => {
          const data: ExtSightsData = {
            items: [...sightsData.items, ...egrknData.items],
            errors: [...(sightsData.errors ?? []), ...(egrknData.errors ?? [])],
          };
          observer.next(data);
          observer.complete();
          this.fetchingSightsSubject.next(data);
        },
      });
    });
  }

  private getSightById$(sightId: SightId): Observable<SightDataExt> {
    return this.requestService
      .getApi<SightResponseItemExt>(`sights/${this.sightIdToNative(sightId)}`)
      .pipe(map((item) => this.prepareExoSight(item)));
  }

  /* Other methods */

  getSightDataExt$(sightId: SightId): Observable<SightDataExt | undefined> {
    this.loggerService.log('getSightDataExt', sightId);

    switch (this.getSightType(sightId)) {
      case SightType.EGRKN:
        return this.egrknService.getSightById$(sightId);
      case SightType.DEFAULT:
        // TODO refac (частично дублируется логика при фильтрации списка)
        return this.getSightById$(sightId).pipe(
          switchMap((sight) => this.handleSightDataExt$(sight)),
          // switchMap((sight) => this.addEgrknData$(sight)),
        );
      default:
        return of(undefined);
    }
  }

  private handleSightDataExt$(sight: SightDataExt): Observable<SightDataExt> {
    return this.fetchingSightsSubject.pipe(
      take(1),
      map(({ items }) => {
        const swnItem = SIGHTS_WITH_NESTED.find(
          (swn) => swn.sightId === sight.id,
        );
        const nested = swnItem
          ? items.filter(({ id }) => swnItem.nested.includes(id))
          : undefined;
        return { ...sight, nested };
      }),
      switchMap((item) => this.addEgrknData$(item)),
    );
  }

  private addEgrknData$(sight: SightDataExt): Observable<SightDataExt> {
    if (!this.needEgrkn() || !sight.okn_id) return of(sight);

    const getNestedByType = (sightType: SightType): SightData[] =>
      sight.nested?.filter(({ type }) => type === sightType) ?? [];

    return this.egrknService.getSightByOknId$(sight.okn_id).pipe(
      map((egrknItem) => {
        if (egrknItem) {
          const { egrknData, okn_title } = egrknItem;
          const images = [...(sight.images || [])];
          if (egrknData?.photoUrl) {
            images.push(this.egrknService.prepareImage(egrknData.photoUrl));
          }

          return {
            ...sight,
            images,
            okn_title,
            nested: [
              ...getNestedByType(SightType.DEFAULT),
              egrknItem,
              ...getNestedByType(SightType.EGRKN),
            ],
          };
        }
        return sight;
      }),
    );
  }

  getSights(params: GetSightsParams): Observable<SightsData> {
    // console.log('--- getSights params:', params);
    return this.fetchingSights$(true).pipe(
      map((sightsData) => this.filterSights(sightsData, params)),
      tap((filtSightsData) => {
        this.sightsDataSubject.next(filtSightsData);
      }),
    );
  }

  private needEgrkn(): boolean {
    // eslint-disable-next-line prettier/prettier
    return !!this.filterParamsStore.get().sightsFilterParams?.okn?.groups.egrkn?.go;
  }

  private prepareSightId(id: number | string, type: SightType): SightId {
    return `${type}${id}`;
  }

  private getSightType(sightId: SightId): SightType | undefined {
    if (sightId.indexOf(SightType.EGRKN) === 0) {
      return SightType.EGRKN;
    }

    if (sightId.indexOf(SightType.DEFAULT) === 0) {
      return SightType.DEFAULT;
    }

    return undefined;
  }

  private sightIdToNative(sightId: SightId): string | number {
    if (sightId.indexOf(SightType.EGRKN) === 0) {
      return sightId.substring(SightType.EGRKN.length);
    }

    return Number(sightId.substring(SightType.DEFAULT.length));
  }

  private filterSights(
    sightsData: ExtSightsData,
    params: GetSightsParams,
  ): SightsData {
    const { filterParams, limit } = params;
    const sightsFilterParams = filterParams.sightsFilterParams || {};
    // console.log('filterSights sightsData:', sightsData);
    // console.log('filterSights sightsFilterParams:', sightsFilterParams);
    let items: SightData[] = [];

    Object.keys(sightsFilterParams).forEach((blockName) => {
      if (sightsFilterParams[blockName].switchedOn) {
        // console.log('switchedOn:', blockName);
        const { groups } = sightsFilterParams[blockName];
        // console.log('groups:', groups);

        items = items.concat(
          sightsData.items.filter((item) => {
            if (blockName === 'okn') {
              return (
                item.okn_category?.some(
                  (value) => groups.okn_category[value],
                ) && item.okn_type?.some((value) => groups.okn_type[value])
              );
            }
            return item.sets?.some((value) => groups.sets[value]);
          }),
        );
      }
    });

    items = [...new Set(items)];

    // Filter by search
    if (filterParams.search) {
      const searchStr = filterParams.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.okn_id === searchStr ||
          item.title.toLowerCase().includes(searchStr) ||
          item.location?.toLowerCase().includes(searchStr),
      );
      // TODO search in text, sort by search?
    }

    items = this.filterNested(items);
    items = this.filterEgrkn(items); // TODO include to filterNested() ?

    if (sightsFilterParams.tur?.switchedOn) {
      items = this.sortBySets(items); // TODO .sort(compareBySets)
    }

    items = items.slice(0, limit);
    // console.log('filterSights items:', items);
    return { items, errors: sightsData.errors };
  }

  private filterNested(items: SightData[]): SightData[] {
    // console.log('*** filterNested:', items);
    this.nestedSights = {};
    const allNested: SightData[] = [];

    SIGHTS_WITH_NESTED.forEach((swn) => {
      const holder = items.find((item) => item.id === swn.sightId);
      if (holder) {
        // console.log('*** holder:', holder?.id, swn.nested);
        const nestedItems = items.filter(({ id }) => swn.nested.includes(id));
        // console.log('*** nestedItems:', nestedItems);
        if (nestedItems.length) {
          holder.nested = nestedItems.filter(
            ({ type }) => type === SightType.DEFAULT,
          );
          allNested.push(...nestedItems);
          nestedItems.forEach(({ id }) => {
            const holdersIds = this.nestedSights[id] || [];
            holdersIds.push(holder.id);
            this.nestedSights[id] = holdersIds;
          });
        } else {
          holder.nested = undefined;
        }
      }
    });

    // console.log('*** allNested:', allNested);
    if (allNested.length) {
      const nestedIds = new Set(allNested.map(({ id }) => id));
      return items.filter(({ id }) => !nestedIds.has(id));
    }
    return items;
  }

  private filterEgrkn(items: SightData[]): SightData[] {
    const egrknItems = items.filter((item) => item.type === SightType.EGRKN);
    const nestedIds: SightId[] = [];

    if (egrknItems.length && egrknItems.length !== items.length) {
      items.forEach((item) => {
        if (item.type === SightType.DEFAULT) {
          const egrknItem = egrknItems.find((ei) => ei.okn_id === item.okn_id);
          if (egrknItem) {
            // item.okn_title = egrknItem.okn_title;
            // item.egrknData = egrknItem.egrknData; // TODO icon, url?
            // item.nested = [...(item.nested ?? []), egrknItem];
            nestedIds.push(egrknItem.id);
          }
        }
      });
    }

    return nestedIds.length
      ? items.filter((item) => !nestedIds.includes(item.id))
      : items;
  }

  private sortBySets(items: SightData[]): SightData[] {
    const mainItems = items.filter((item) => item.sets?.[0] === 'main');
    const musItems = items.filter((item) => item.sets?.[0] === 'mus');
    const otherItems = items.filter(
      (item) =>
        !mainItems.some((it) => it.id === item.id) &&
        !musItems.some((it) => it.id === item.id),
    );

    return [...mainItems, ...musItems, ...otherItems];
  }

  getSightsIds(sightId: SightId): SightId[] {
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
      ? this.requestService
          .getApi<SightByLink[]>('sight-links', { slugs: slugs.join(',') })
          .pipe(
            tap((sights) => {
              const sightLinks: SightLink[] = sights.map((item) => ({
                link: `/${gbPrefix}${item.slug}/`,
                sightId: this.prepareSightId(item.post_id, SightType.DEFAULT),
                title: item.title,
              }));

              this.sightLinks = this.sightLinks.concat(sightLinks);
            }),
            map(() => this.sightLinks),
          )
      : of(this.sightLinks);
  }

  redirectToSightForMore(sightId?: SightId): void {
    this.settingsService.setGBQueryParams({ sight: sightId }, 'merge');
  }
}
