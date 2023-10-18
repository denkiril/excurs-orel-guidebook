import { Injectable, TransferState, makeStateKey } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import {
  ImageItem,
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
  GET_EGRKN_URL,
} from '../egrkn.constants';
import { AppService } from 'src/app/services/app.service';
import { LoggerService } from 'src/app/services/logger.service';
import { RequestService } from 'src/app/services/request.service';

const EGRKN_STATE_KEY = makeStateKey<EgrknResponse>('egrkn');

@Injectable({
  providedIn: 'root',
})
export class EgrknService {
  private sightDataItems: SightDataExt[] = [];

  constructor(
    private readonly transferState: TransferState,
    private readonly appService: AppService,
    private readonly loggerService: LoggerService,
    private readonly requestService: RequestService,
  ) {}

  getEgrknSights$(needEgrkn?: boolean): Observable<EgrknSights> {
    this.loggerService.log('// getEgrknSights...', this.sightDataItems.length);

    return (
      this.sightDataItems.length ? of(undefined) : this.fetchEgrknData$()
    ).pipe(
      map(() => ({ items: needEgrkn === false ? [] : this.sightDataItems })),
    );
    // FETCH_EGRKN_ERROR TODO ?
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

  private fetchEgrknData$(): Observable<void> {
    // console.log('fetchEgrknData...');
    return this.requestEgrknData$().pipe(
      tap(({ data }) => {
        // console.log('fetchEgrknData data.length:', data.length);
        this.sightDataItems = this.prepareSightData(data);
      }),
      map(() => undefined),
    );
  }

  private requestEgrknData$(): Observable<EgrknResponse> {
    const transfered = this.transferState.get(EGRKN_STATE_KEY, undefined);
    if (transfered) return of(transfered);

    const egrknFilter = {
      'data.general.address.fullAddress': { $search: 'орел' },
      'data.general.region.value': { $eq: 'Орловская область' },
    };
    const url = new URL(GET_EGRKN_URL);
    url.searchParams.append('f', JSON.stringify(egrknFilter));
    url.searchParams.append('l', '500');

    return this.appService.isServer
      ? this.requestService.getMkrfOpendata<EgrknResponse>(url.toString()).pipe(
          tap((resp) => {
            this.loggerService.log('getMkrfOpendata resp.total:', resp.total);
            this.transferState.set(EGRKN_STATE_KEY, resp);
          }),
          catchError((err) => {
            // this.loggerService.error('getMkrfOpendata', err);
            return this.requestLocalEgrknData$();
          }),
        )
      : this.requestLocalEgrknData$();
  }

  private requestLocalEgrknData$(): Observable<EgrknResponse> {
    return this.requestService.getUrl<EgrknResponse>(
      this.appService.getAssetsUrl() + LOCAL_EGRKN_URL,
    );
  }

  private prepareSightData(egrknItems: EgrknItem[]): SightDataExt[] {
    // eslint-disable-next-line prettier/prettier
    // console.log('objectType:', egrknItems.map((item) => item.data.general.objectType));
    // eslint-disable-next-line prettier/prettier
    // console.log('categoryType:', egrknItems.map((item) => item.data.general.categoryType));
    // eslint-disable-next-line prettier/prettier
    // console.log('typologies:', egrknItems.map((item) => JSON.stringify(item.data.general.typologies)));
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
        title: general.name, // this.prepareTitle(general.name, address),
        okn_title: general.name,
        okn_date: general.createDate,
        okn_type: general.typologies.map(({ id }) => EGRKN_OKN_TYPES[id]),
        okn_category: [EGRKN_OKN_CATEGORIES[general.categoryType.id]],
        location: address,
        geolocation: this.prepareSightGeolocation(general),
        registry_date: general.documents.find((doc) => doc.date)?.date,
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

  // private prepareTitle(title: string, address: string): string {
  //   return title === DEFAULT_OKN_TITLE && address
  //     ? `${title}, ${address}`
  //     : title;
  // }

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

      this.loggerService.browserWarn('checkBounds(lat, lng) fail:', lat, lng);
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
          // eslint-disable-next-line prettier/prettier
          this.loggerService.browserLog(`additionalCoordinates for ${address.fullAddress}:`, general);
          // TODO calc center?
          const [coord1, coord2] = coordsItem1;
          const coords = checkBounds(coord1, coord2);
          if (coords) return coords;
        }
      }

      return undefined;
    };

    const geolocation =
      checkCoordinates(address?.mapPosition?.coordinates) ??
      checkCoordinates(additionalCoordinates?.[0].coordinates);

    if (!geolocation) {
      this.loggerService.browserWarn('SightGeolocation is undefined', general);
    }

    return geolocation;
  }

  private prepareEgrknData(item: EgrknItem): EgrknData {
    return {
      egrknUrl: `${EGRKN_OBJECT_URL}${item.nativeId}`,
      photoUrl: item.data.general.photo?.url,
      // item,
    };
  }
}
