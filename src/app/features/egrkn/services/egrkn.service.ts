import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { RequestService } from 'src/app/services/request.service';
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
} from '../egrkn.constants';

@Injectable({
  providedIn: 'root',
})
export class EgrknService {
  private sightDataItems: SightDataExt[] = [];

  constructor(private readonly requestService: RequestService) {}

  getEgrknSights$(): Observable<EgrknSights> {
    return this.sightDataItems.length
      ? of({ items: this.sightDataItems })
      : this.fetchEgrknData$();
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

  private fetchEgrknData$(): Observable<EgrknSights> {
    return this.requestEgrknData$().pipe(
      tap(({ data }) => {
        this.sightDataItems = this.prepareSightData(data);
      }),
      map(() => ({ items: this.sightDataItems })),
    );
  }

  private requestEgrknData$(): Observable<EgrknResponse> {
    // return this.requestService.getUrl<EgrknResponse>(GET_EGRKN_URL).pipe(
    //   catchError(() =>
    //     // FETCH_EGRKN_ERROR TODO ?
    //     this.requestService.getUrl<EgrknResponse>(LOCAL_EGRKN_URL),
    //   ),
    // );
    return this.requestService.getUrl<EgrknResponse>(LOCAL_EGRKN_URL);
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

      console.warn('checkBounds(lat, lng) fail:', lat, lng);
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
          console.log(`additionalCoordinates for ${address.fullAddress}:`, general);
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
      console.warn('SightGeolocation is undefined', general);
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
