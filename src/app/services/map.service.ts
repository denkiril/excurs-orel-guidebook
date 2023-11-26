import { Injectable } from '@angular/core';
import {
  Observable,
  ReplaySubject,
  Subject,
  combineLatest,
  of,
  throwError,
} from 'rxjs';
import {
  delay,
  retryWhen,
  take,
  takeUntil,
  concat,
  catchError,
  distinctUntilChanged,
} from 'rxjs/operators';

import {
  SightsData,
  SightData,
  SightId,
  MultiGeolocation,
} from '../models/sights.models';
import { ConfigService } from './config.service';
import { DocumentService, MediaSize } from './document.service';
import { WindowService } from './window.service';
import { SightsService } from './sights.service';
import { ActiveSightsService } from './active-sights.service';
import { FilterParamsStoreService } from '../store/filter-params-store.service';
import { StoreService } from '../store/store.service';

const DEFAULT_COLOR = '#005281'; // 015a8d
const ACTIVE_COLOR = '#bc3134'; // ffd649
const DEFAULT_PRESET = 'islands#Icon';
const ACTIVE_PRESET = 'islands#blueDotIcon';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private readonly destroy$ = new Subject();
  private activeSights: SightId[] = [];
  private mapActiveSights: SightId[] = [];
  private sightsData?: SightsData;
  private sightForMore?: SightId;

  private ymaps?: any;
  private map: any;
  private storage: any;
  private multiCoordsStorage: any;
  // private clusterer: any;

  initialized$ = new ReplaySubject<void>();
  private showMultiCoords$ = new ReplaySubject<boolean>();

  constructor(
    private readonly configService: ConfigService,
    private readonly windowService: WindowService,
    private readonly documentService: DocumentService,
    private readonly sightsService: SightsService,
    private readonly storeService: StoreService,
    private readonly activeSightsService: ActiveSightsService,
    private readonly filterParamsStore: FilterParamsStoreService,
  ) {}

  private checkApi$(): Observable<void> {
    return this.windowService.windowRef.ymaps
      ? of()
      : this.addScript$().pipe(
          // Если запрос возвращает ошибку (например сервер недоступен), делаем ещё 2 попытки с задержкой 5 сек,
          // после чего кидаем ошибку. TODO retryWhen и concat - deprecated, refac after upgrade rxjs to 7+
          // retry({ count: 3, delay: 5000 }) [?]
          retryWhen((error) =>
            error.pipe(delay(5000), take(2), concat(throwError(error))),
          ),
          catchError((error) => {
            return throwError(error);
          }),
        );
  }

  private addScript$(): Observable<void> {
    const { documentRef } = this.documentService;
    const { YMAPS_APIKEY } = this.configService.config;
    const apikey = YMAPS_APIKEY ? `&apikey=${YMAPS_APIKEY}` : '';
    const YMAPS_API_URL = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${apikey}`;
    const YMAPS_SCRIPT_ID = 'YMapsScriptID';

    return new Observable<void>((subscriber) => {
      const script = documentRef.createElement('script');
      script.src = YMAPS_API_URL;
      script.id = YMAPS_SCRIPT_ID;
      script.async = true;
      script.onload = (): void => {
        subscriber.next();
        subscriber.complete();
      };
      script.onerror = (): void => {
        console.error('MapService.addScript error!');
        documentRef.getElementById(YMAPS_SCRIPT_ID)?.remove();
        subscriber.error();
      };
      documentRef.body.appendChild(script);
    });
  }

  init$(container: HTMLElement, sightsData: SightsData): Observable<void> {
    return new Observable((subscriber) => {
      const completeError = (err?: any): void => {
        console.error('MapService.init error!', err);
        subscriber.error();
      };

      this.checkApi$()
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          () => {
            this.ymaps = this.windowService.windowRef.ymaps;

            if (this.ymaps) {
              this.ymaps.ready(() => {
                this.initMap(container, sightsData);
                setTimeout(() => this.initMapSubscriptions(), 500);
                this.initialized$.next();
                subscriber.next();
                subscriber.complete();
              });
            } else {
              completeError('no ymaps');
            }
          },
          () => completeError('checkApi'),
        );
    });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initMap(container: HTMLElement, sightsData: SightsData): void {
    // console.log('initMap');
    this.sightsData = sightsData;

    // Setup map and markers
    this.map = new this.ymaps.Map(container, {
      center: [52.967631, 36.069584],
      // controls: ['geolocationControl', 'zoomControl'],
      zoom: 12,
    });

    // this.clusterer = new this.ymaps.Clusterer({
    //   clusterIconColor: DEFAULT_COLOR,
    // });

    this.setMarkers();
    // this.initMapSubscriptions();

    // Setup map controls
    const searchControl = this.map.controls.get('searchControl');
    if (searchControl) {
      searchControl.events.add('submit', (event: any) => {
        console.log('searchControl request:', event.originalEvent.request);
        // TODO ymaps search hints
      });
    }

    this.documentService.getMediaSize$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mediaSize) => {
        // console.log('mediaSize', mediaSize);
        // const zoomControl = this.map.controls.get('zoomControl');
        this.map.controls
          .get('zoomControl')
          ?.options.set(
            'size',
            mediaSize === MediaSize.Mobile ? 'small' : 'large',
          );
        // if (mediaSize === MediaSize.Mobile) {
        //   // map.behaviors.disable('scrollZoom');
        //   this.map.controls.remove('zoomControl');
        // } else {
        //   this.map.controls.add('zoomControl');
        // }
      });

    // Watch zoom
    this.map.events.add('boundschange', (ev: any) => {
      // var state = this.map.action.getCurrentState();
      // console.log('boundschange', ev.get('oldZoom'), ev.get('newZoom'));
      this.showMultiCoords$.next(ev.get('newZoom') > 15);
    });
    // console.log('map:', this.map);
  }

  private setMarkers(update = false): void {
    // console.log('setMarkers', update);
    const markers = this.makeMarkers(this.sightsData?.items || []);

    // this.clusterer.removeAll();
    this.map.geoObjects.removeAll();
    this.storage = this.ymaps.geoQuery(markers);
    // this.clusterer.add(markers);
    // this.map.geoObjects.add(this.clusterer);
    this.storage.addToMap(this.map);
    // console.log('[map]:', this.map);
    // console.log('[storage]:', this.storage);

    // center map
    let needCenter = true;
    if (update) {
      this.mapActiveSights = [];
      this.activeSightsService.clear();
      // this.storage.each((mark: any) => {
      //   const geoObjectState = this.clusterer.getObjectState(mark);
      //   if (geoObjectState.isShown === false) needCenter = true;
      // });
      const shownObjects = this.storage.searchIntersect(this.map);
      needCenter = shownObjects.getLength() < markers.length;
    }

    if (markers.length > 0 && needCenter) {
      this.map
        // .setBounds(this.map.geoObjects.getBounds(), { checkZoomRange: true })
        .setBounds(this.map.geoObjects.getBounds(), { duration: 300 })
        .then(() => {
          if (this.map.getZoom() > 16) this.map.setZoom(16);
        })
        .catch(() => {
          // empty
        });
    }
  }

  private makeMarkers(items: SightData[]): any[] {
    const markers: any[] = [];

    items.forEach((item) => {
      if (item.geolocation) {
        const { lat, lng } = item.geolocation;
        const { title, location } = item;
        // const url = item.permalink;
        const sightId = item.id;
        const thumbUrl = item.thumb_url;
        const nested = item.nested?.length
          ? `<p>+ ${item.nested.map((s) => s.title).join('</p><p>')}</p>`
          : '';
        const content = `<header>
          <h3>{{ properties.title }}</h3>
          ${nested}
          <p>{{ properties.location }}</p>
          </header>
          ${thumbUrl ? '<img src="{{ properties.thumbUrl }}" />' : ''}`;

        const marker = new this.ymaps.Placemark(
          [lat, lng],
          {
            sightId,
            title,
            location,
            thumbUrl,
            clusterCaption: title,
            // balloonContent: `${clusterImg}<p><a href="${url}">Перейти на страницу объекта >></a></p>`,
          },
          {
            preset: DEFAULT_PRESET,
            iconColor: DEFAULT_COLOR,
            balloonContentLayout: this.ymaps.templateLayoutFactory.createClass(
              `<div class="ymc-template">${content}</div>`,
            ),
            hintContentLayout: this.ymaps.templateLayoutFactory.createClass(
              `<div class="ymc-template ymc-hint">${content}</div>`,
            ),
          },
        );

        marker.events.add(['mouseenter', 'balloonopen'], () => {
          // e.get('target').options.set('iconColor', ACTIVE_COLOR);
          const index = this.mapActiveSights.indexOf(sightId);
          if (index === -1) {
            this.mapActiveSights.push(sightId);
            this.activeSightsService.add(sightId);
          }
        });

        marker.events.add(['mouseleave', 'balloonclose'], () => {
          // e.get('target').options.set('iconColor', DEFAULT_COLOR);
          const index = this.mapActiveSights.indexOf(sightId);
          if (index > -1) {
            this.mapActiveSights.splice(index, 1);
            this.activeSightsService.delete(sightId);
          }
        });

        marker.balloon.events.add('click', () => {
          this.sightsService.redirectToSightForMore(sightId);
        });

        marker.hint.events.add('click', () => {
          this.sightsService.redirectToSightForMore(sightId);
        });

        markers.push(marker);
      }
    });

    return markers;
  }

  private initMapSubscriptions(): void {
    this.activeSightsService.activeSights$
      .pipe(takeUntil(this.destroy$))
      .subscribe((activeSights) => {
        // console.log('$$$ cached activeSights:', this.activeSights);
        // console.log('$$$ new activeSights:', activeSights);
        if (this.arraysNotEquals(this.activeSights, activeSights) === true) {
          this.activeSights = activeSights;
          this.updateMarkers();
        }
      });

    this.filterParamsStore.sightForMore$
      .pipe(takeUntil(this.destroy$))
      .subscribe((sightForMore) => {
        if (this.sightForMore !== sightForMore) {
          this.sightForMore = sightForMore;
          this.updateMarkers();
        }
      });

    combineLatest([
      this.showMultiCoords$.pipe(distinctUntilChanged()),
      this.storeService.select$('sightForMore'),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([showMultiCoords, sightForMoreState]) => {
        const { sightForMore } = sightForMoreState;

        this.updateMultiCoords(showMultiCoords, sightForMore?.multiGeolocation);

        if (sightForMore) {
          this.flyToMarker(sightForMore);
        }
      });
  }

  private updateMarkers(): void {
    this.storage.each((mark: any) => {
      const sightId = mark.properties.get('sightId');
      const isActive = this.activeSights.includes(sightId);
      const isMore = sightId === this.sightForMore;

      mark.options.set('iconColor', isActive ? ACTIVE_COLOR : DEFAULT_COLOR);
      mark.options.set('preset', isMore ? ACTIVE_PRESET : DEFAULT_PRESET);
      mark.options.set('zIndex', Number(isActive || isMore));
    });
  }

  update(sightsData: SightsData): void {
    // console.log('mapService update...');
    this.initialized$.subscribe(() => {
      if (this.sightsDataHasChanged(sightsData) === true) {
        // console.log('sightsData has changed. LETS ROCK!!');
        this.sightsData = sightsData;
        this.setMarkers(true);
      }
    });
  }

  private sightsDataHasChanged(sightsData: SightsData): boolean {
    if (this.sightsData?.items.length !== sightsData.items.length) return true;

    // const compareFn = (a: number, b: number): number => a - b;
    const ids1 = this.sightsData.items.map((item) => item.id); // .sort(compareFn);
    const ids2 = sightsData.items.map((item) => item.id); // .sort(compareFn);
    // console.log('ids1:', ids1);
    // console.log('ids2:', ids2);

    return ids1.some((v, i) => v !== ids2[i]);
  }

  private arraysNotEquals(arr1: SightId[], arr2: SightId[]): boolean {
    if (arr1.length !== arr2.length) return true;

    // const compareFn = (a: SightId, b: SightId): number => a - b;
    const sorted1 = arr1.sort();
    const sorted2 = arr2.sort();

    return sorted1.some((v, i) => v !== sorted2[i]);
  }

  private updateMultiCoords(
    showMultiCoords: boolean,
    multiGeolocation?: MultiGeolocation,
  ): void {
    if (this.multiCoordsStorage) {
      this.multiCoordsStorage.removeFromMap(this.map);
    }

    if (!showMultiCoords || !multiGeolocation?.length) return;

    const geoObjects: any[] = [];

    multiGeolocation.forEach((coords) => {
      coords.forEach((coord, index) => {
        const marker = new this.ymaps.Placemark(
          coord,
          {
            // iconContent: index,
          },
          {
            // preset: 'islands#blueCircleIcon',
            iconLayout: 'default#image',
            iconImageHref: '/assets/images/dot.svg',
            iconImageSize: [12, 12],
            iconImageOffset: [-6, -6],
            zIndex: -1,
          },
        );

        geoObjects.push(marker);
      });

      // const polygon = new this.ymaps.Polygon([coords.filter((v, i) => i > 0)]);
      // geoObjects.push(polygon);
    });

    this.multiCoordsStorage = this.ymaps.geoQuery(geoObjects);
    this.multiCoordsStorage.addToMap(this.map);
  }

  private flyToMarker(sight: SightData): void {
    const searchResult = this.storage.search(
      `properties.sightId=="${sight.id}"`,
    );
    if (searchResult.getLength() > 0) {
      const isMarkerShown =
        searchResult.searchIntersect(this.map).getLength() > 0;
      if (!isMarkerShown) {
        this.map.panTo(searchResult.getBounds());
      }
    }
  }
}
