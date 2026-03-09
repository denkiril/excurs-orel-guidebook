import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, ReplaySubject } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import {
  ImageItem,
  MultiGeolocation,
  SightDataExt,
  SightGeolocation,
  SightType,
} from 'src/app/models/sights.models';
import {
  EgrknSights,
  EgrknItem,
  EgrknItemGeneral,
  EgrknResponse,
  EgrknData,
} from '../egrkn.model';
import {
  LOCAL_EGRKN_URL,
  EGRKN_OKN_TYPES,
  EGRKN_OKN_CATEGORIES,
  DEFAULT_ADDRESS_PART,
  EGRKN_OBJECT_URL,
} from '../egrkn.constants';
import { AppService } from 'src/app/services/app.service';
import { LoggerService } from 'src/app/services/logger.service';
import { RequestService } from 'src/app/services/request.service';
import { TransferStateService } from 'src/app/services/transfer-state.service';
import { filterNullable } from 'src/app/core/rxjs';

const showLogs = true;

@Injectable({
  providedIn: 'root',
})
export class EgrknService {
  private egrknItems$ = new BehaviorSubject<SightDataExt[] | undefined>(
    undefined,
  );
  private needLoadEgrkn$ = new ReplaySubject<void>(1);

  constructor(
    private readonly appService: AppService,
    private readonly loggerService: LoggerService,
    private readonly requestService: RequestService,
    private readonly transferStateService: TransferStateService,
  ) {
    this.init();
  }

  getEgrknSights$(needEgrkn?: boolean): Observable<EgrknSights> {
    this.loggerService.log(
      `// getEgrknSights... ${this.egrknItems$.value?.length}`,
    );

    return this.egrknItems$.pipe(
      tap((value) => !value && this.needLoadEgrkn$.next()),
      filterNullable(),
      map((items) => ({ items: needEgrkn === false ? [] : items })),
      take(1),
    );
  }

  getSightById$(id: string): Observable<SightDataExt | undefined> {
    return this.getEgrknSights$().pipe(
      map(({ items }) => items.find((item) => item.id === id)),
    );
  }

  getSightByOknId$(id: string): Observable<SightDataExt | undefined> {
    return this.getEgrknSights$().pipe(
      map(({ items }) => items.find((item) => item.okn_id === id)),
    );
  }

  prepareImage(url: string): ImageItem {
    return {
      alt: url,
      caption: 'Фото из базы госреестра',
      title: '',
      full: url,
    };
  }

  private init(): void {
    this.needLoadEgrkn$
      .pipe(
        take(1),
        switchMap(() => this.requestEgrknData$()),
      )
      .subscribe((items) => this.egrknItems$.next(items));
  }

  private requestEgrknData$(): Observable<SightDataExt[]> {
    const transfered = this.transferStateService.getEgrkn();
    if (transfered) return of(transfered);

    const startTime = Date.now();
    return this.requestService.getApi<EgrknResponse>('egrkn').pipe(
      map((resp) => {
        const duration = Date.now() - startTime;
        this.loggerService.log(
          `get_egrkn total=${resp.total}, duration=${duration}`,
        );
        const items = this.prepareSightData(resp.data);
        this.transferStateService.setEgrkn(items);
        return items;
      }),
    );
  }

  // private requestLocalEgrknData$(): Observable<SightDataExt[]> {
  //   const url = this.appService.getAssetsUrl() + LOCAL_EGRKN_URL;

  //   return this.requestService
  //     .getUrl<EgrknResponse>(url)
  //     .pipe(map((resp) => this.prepareSightData(resp.data)));
  // }

  private prepareSightData(egrknItems: EgrknItem[]): SightDataExt[] {
    if (this.appService.isDev) {
      const warnItems = egrknItems.filter(
        (item) =>
          item.data.general.typologies?.length !== 1 ||
          item.data.general.typologies?.some((t) => t.id === '1'), // Археология
      );
      this.loggerService.browserLog('!! warnItems:', warnItems);
    }

    const compareByCategory = (a: EgrknItem, b: EgrknItem): number =>
      Number(a.data.general.categoryType.id) -
      Number(b.data.general.categoryType.id);

    return egrknItems.sort(compareByCategory).map((item) => {
      const { general } = item.data;
      const address = this.prepareAdress(general.address.fullAddress);
      const egrknData = this.prepareEgrknData(item);

      return {
        id: `${SightType.EGRKN}${general.regNumber}`,
        type: SightType.EGRKN,
        okn_id: general.regNumber,
        title: general.name,
        okn_title: general.name,
        okn_date: general.createDate,
        okn_type: general.typologies.map(({ id }) => EGRKN_OKN_TYPES[id]),
        okn_category: [EGRKN_OKN_CATEGORIES[general.categoryType.id]],
        location: address,
        geolocation: this.prepareSightGeolocation(general),
        multiGeolocation: this.prepareMultiGeolocation(general),
        registry_date: general.documents?.find((doc) => doc.date)?.date,
        images: egrknData.photoUrl
          ? [this.prepareImage(egrknData.photoUrl)]
          : undefined,
        // gba_rating: '', ?
        egrknData,
      };
    });
  }

  private prepareAdress(address: string): string {
    return (address?.replace(DEFAULT_ADDRESS_PART, '') || '').trim();
  }

  private prepareSightGeolocation(
    general: EgrknItemGeneral,
  ): SightGeolocation | undefined {
    const { address, additionalCoordinates } = general;

    const checkBounds = (
      lat: number,
      lng: number,
    ): SightGeolocation | undefined => {
      if (
        lat > 52.892324 &&
        lat < 53.055147 &&
        lng > 35.931371 &&
        lng < 36.239682
      )
        return { lat: `${lat}`, lng: `${lng}` };

      if (showLogs) {
        this.loggerService.browserWarn('checkBounds(lat, lng) fail:', lat, lng);
      }
      return undefined;
    };

    const checkCoordinates = (
      coordinates?: Array<number | number[]>,
    ): SightGeolocation | undefined => {
      if (coordinates?.length) {
        const [coordsItem1, coordsItem2] = coordinates;
        if (
          typeof coordsItem1 === 'number' &&
          typeof coordsItem2 === 'number'
        ) {
          const coords = checkBounds(coordsItem2, coordsItem1);
          if (coords) return coords;
        } else if (Array.isArray(coordsItem1)) {
          if (showLogs) {
            // eslint-disable-next-line prettier/prettier
            this.loggerService.browserLog(`additionalCoordinates for ${address.fullAddress}:`, general);
          }

          const center = this.calcCenter(coordinates as number[][]);
          const coords = checkBounds(center[0], center[1]);
          if (coords) return coords;
        }
      }

      return undefined;
    };

    const geolocation =
      checkCoordinates(address?.mapPosition?.coordinates) ??
      checkCoordinates(additionalCoordinates?.[0].coordinates);

    if (!geolocation && showLogs) {
      this.loggerService.browserWarn('SightGeolocation is undefined', general);
    }

    return geolocation;
  }

  private calcCenter(coords: number[][]): number[] {
    const getAverage = (numbers: number[]): number => {
      return numbers.reduce((a, b) => a + b) / numbers.length;
    };

    return [
      getAverage(coords.map((item) => item[0])),
      getAverage(coords.map((item) => item[1])),
    ];
  }

  private prepareMultiGeolocation(
    general: EgrknItemGeneral,
  ): MultiGeolocation | undefined {
    let multiGeolocation = general.additionalCoordinates?.map(
      (item) => item.coordinates,
    );

    // if (multiGeolocation?.length && !this.appService.isServer) {
    //   multiGeolocation = multiGeolocation.map((coords) =>
    //     this.getSortedCWCoords(coords),
    //   );
    // }

    return multiGeolocation;
  }

  // private getSortedCWCoords(coords: number[][]): number[][] {
  //   if (!coords.length) return [];

  //   const center = this.calcCenter(coords);
  //   // sort CW ...
  //   const sortedCoords = [...coords].sort((a, b) => b[0] - a[0]);
  //   console.log('sorted 1', [...sortedCoords]);
  //   const result: number[][] = [sortedCoords[0]];
  //   sortedCoords.shift();
  //   console.log('sorted 2', [...sortedCoords]);
  //   while (sortedCoords.length) {
  //     const baseCoords: number[] = result[result.length - 1];
  //     const baseVector: number[] = [baseCoords[0] + 10, baseCoords[1]];
  //     // calc degrees (vectors?) from result.last to all in sortedCoords (rest)
  //     const vectors = sortedCoords.map((coords, index) => ({
  //       index,
  //       coords,
  //       angle: this.calcAngle(baseVector, coords),
  //     }));
  //     const vector = vectors.sort((a, b) => a.angle - b.angle)[0];
  //     result.push(...sortedCoords.splice(vector.index, 1));
  //     // sorted.splice(index, 1);
  //     console.log('vectors', vectors);
  //   }
  //   // console.log('coords 2', JSON.stringify(coords));
  //   // .sort((a, b) => a[0] - b[0]);
  //   // coords = [
  //   //   // [52.96488928, 36.0702757],
  //   //   // [52.96392454, 36.06861],
  //   //   // [52.96440542, 36.07052762],
  //   //   // [52.96456143, 36.07079413],
  //   //   // [52.96373943, 36.06892491],
  //   //   // [52.96451624, 36.07034058],
  //   //   [52.96488928, 36.0702757],
  //   //   [52.96456143, 36.07079413],
  //   //   [52.96440542, 36.07052762],
  //   //   [52.96451624, 36.07034058],
  //   //   [52.96373943, 36.06892491],
  //   //   [52.96392454, 36.06861],
  //   // ];
  //   // const center = [52.96439, 36.06967];

  //   return [center, ...result];
  // }

  // private calcAngle(baseCoords: number[], targetCoords: number[]): number {
  //   const cosAng =
  //     this.calcScalarProduct(baseCoords, targetCoords) /
  //     (this.calcVectorLenght(baseCoords) * this.calcVectorLenght(targetCoords));
  //   return Math.acos(cosAng);
  // }

  // private calcScalarProduct(a: number[], b: number[]): number {
  //   return a[0] * a[1] + b[0] * b[1];
  // }

  // private calcVectorLenght(a: number[]): number {
  //   return Math.sqrt(a[0] ** 2 + a[1] ** 2);
  // }

  private prepareEgrknData(item: EgrknItem): EgrknData {
    return {
      egrknUrl: `${EGRKN_OBJECT_URL}${item.nativeId}`,
      photoUrl: item.data.general.photo?.url,
      // item,
    };
  }

  // private logItem(tag: string, items: SightDataExt[]) {
  //   const item = items.find((i) => i.okn_id === '571410863010006');
  //   this.loggerService.log(`>> item ${tag}:`, String(item?.location));
  // }
}
