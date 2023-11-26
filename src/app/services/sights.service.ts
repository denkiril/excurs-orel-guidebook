import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, Observable, of, ReplaySubject, Subject, timer } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

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
  MultiGeolocation,
} from '../models/sights.models';
import { AppService } from './app.service';
import { RequestService } from './request.service';
import { EgrknService } from '../features/egrkn/services/egrkn.service';
import { FilterParamsStoreService } from '../store/filter-params-store.service';
import { SettingsService } from './settings.service';
import { SIGHTS_WITH_NESTED } from '../models/sights.constants';
import { LoggerService } from './logger.service';
import { TransferStateService } from './transfer-state.service';

interface SightByLink {
  slug: string;
  post_id: number;
  title: string;
}

interface ExtSightsData {
  exoItems: SightData[];
  egrknItems: SightDataExt[];
  errors?: SightsDataError[];
}

// TODO
// refac setSightForMore/redirectToSightForMore etc. - route-driven state

@Injectable({
  providedIn: 'root',
})
export class SightsService {
  private readonly destroyRef = inject(DestroyRef);

  private sightsData: SightsData = {
    items: [],
  };

  private sightLinks: SightLink[] = [];
  private nestedSights: { [key: string]: string[] } = {};

  private readonly fetchingSightsSubject = new ReplaySubject<ExtSightsData>(1);
  private readonly sightsDataSubject = new Subject<SightsData>(); // ReplaySubject (?)
  readonly sightsData$ = this.sightsDataSubject.asObservable();

  constructor(
    private readonly appService: AppService,
    private readonly loggerService: LoggerService,
    private readonly egrknService: EgrknService,
    private readonly filterParamsStore: FilterParamsStoreService,
    private readonly requestService: RequestService,
    private readonly settingsService: SettingsService,
    private readonly transferStateService: TransferStateService,
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
    const transfered = this.transferStateService.getSights();

    return transfered.length
      ? of(transfered)
      : this.requestService.getApi<SightResponseItem[]>('sights').pipe(
          tap((sights) => {
            this.transferStateService.setSights(sights);
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

  private fetchingSights$(): Observable<ExtSightsData> {
    // console.log('fetchingSights...');
    const withDelay = !this.appService.isServer;

    return new Observable<ExtSightsData>((observer) => {
      forkJoin({
        exoData: this.fetchSights$(),
        egrknData: this.egrknService.getEgrknSights$(), // this.needEgrkn()
        delay: timer(withDelay ? 300 : 0),
      }).subscribe({
        next: ({ exoData, egrknData }) => {
          const data: ExtSightsData = {
            exoItems: exoData.items,
            egrknItems: egrknData.items,
            errors: [...(exoData.errors ?? []), ...(egrknData.errors ?? [])],
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
    return this.getSightDataExtObservable$(sightId).pipe(
      takeUntilDestroyed(this.destroyRef),
    );
  }

  private getSightDataExtObservable$(
    sightId: SightId,
  ): Observable<SightDataExt | undefined> {
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
      map(({ exoItems, egrknItems }) => {
        const nested = this.getNested(
          sight,
          [...exoItems, ...egrknItems],
          egrknItems,
        );
        const egrknItem = sight.okn_id
          ? egrknItems.find((ei) => ei.okn_id === sight.okn_id)
          : undefined;
        const images = [...(sight.images || [])];
        if (egrknItem?.egrknData?.photoUrl) {
          images.push(
            this.egrknService.prepareImage(egrknItem.egrknData.photoUrl),
          );
        }

        return {
          ...sight,
          images,
          nested,
          multiGeolocation: this.checkMultiGeolocation(nested),
          okn_title: egrknItem?.okn_title,
        };
      }),
    );
  }

  getSights(params: GetSightsParams): Observable<SightsData> {
    // console.log('--- getSights params:', params);
    return this.fetchingSights$().pipe(
      map((sightsData) => this.filterSights(sightsData, params)),
      tap((filtSightsData) => {
        this.sightsDataSubject.next(filtSightsData);
      }),
    );
  }

  private needEgrkn(): boolean {
    // eslint-disable-next-line prettier/prettier
    return !!this.filterParamsStore.get()?.sightsFilterParams?.okn?.groups.egrkn?.go;
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
    const needSights = [
      ...sightsData.exoItems,
      ...(this.needEgrkn() ? sightsData.egrknItems : []),
    ];
    let items: SightData[] = [];

    Object.keys(sightsFilterParams).forEach((blockName) => {
      if (sightsFilterParams[blockName].switchedOn) {
        // console.log('switchedOn:', blockName);
        const { groups } = sightsFilterParams[blockName];
        // console.log('groups:', groups);

        items = items.concat(
          needSights.filter((item) => {
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

    items = this.addAndFilterNested(items, sightsData.egrknItems);

    if (sightsFilterParams.tur?.switchedOn) {
      items = this.sortBySets(items); // TODO .sort(compareBySets)
    }

    items = items.slice(0, limit);
    // console.log('filterSights items:', items);
    return { items, errors: sightsData.errors };
  }

  private addAndFilterNested(
    items: SightData[],
    egrknItems: SightData[],
  ): SightData[] {
    const allNested: SightData[] = [];
    this.nestedSights = {};

    items
      .filter(({ type }) => type === SightType.DEFAULT)
      .forEach((item) => {
        const nested = this.getNested(item, items, egrknItems);

        if (nested?.length) {
          allNested.push(...nested);
          nested.forEach(({ id }) => {
            const holdersIds = this.nestedSights[id] || [];
            holdersIds.push(item.id);
            this.nestedSights[id] = holdersIds;
          });
        }

        item.nested = nested;
        item.multiGeolocation = this.checkMultiGeolocation(nested);
      });

    const nestedIds = allNested.map((item) => item.id);
    return nestedIds.length
      ? items.filter((item) => !nestedIds.includes(item.id))
      : items;
  }

  private getNested(
    item: SightData,
    items: SightData[],
    egrknItems: SightData[],
  ): SightData[] | undefined {
    const swnItem = SIGHTS_WITH_NESTED.find((swn) => swn.sightId === item.id);
    const nested = swnItem
      ? items.filter(({ id }) => swnItem.nested.includes(id))
      : [];

    const egrknItem = item.okn_id
      ? egrknItems.find((ei) => ei.okn_id === item.okn_id)
      : undefined;
    if (egrknItem) {
      if (!nested.length) {
        nested.push(egrknItem);
      } else {
        let insertIndex = nested.findIndex(
          ({ type }) => type === SightType.EGRKN,
        );
        if (insertIndex === -1) insertIndex = nested.length;
        nested.splice(insertIndex, 0, egrknItem);
      }
    }

    return nested.length ? nested : undefined;
  }

  private checkMultiGeolocation(
    nested?: SightData[],
  ): MultiGeolocation | undefined {
    return nested?.find((item) => item.multiGeolocation)?.multiGeolocation;
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

  // TODO test
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
    // console.log('redirectToSightForMore', sightId);
    this.settingsService.setGBQueryParams({ sight: sightId }, 'merge');
  }
}
