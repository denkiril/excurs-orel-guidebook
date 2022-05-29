import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { DocumentService, MediaSize } from './document.service';
import { WindowService } from './window.service';
import { SightData, SightsData, SightsService } from './sights.service';

const { YMAPS_APIKEY } = environment;
const apikey = YMAPS_APIKEY ? `&apikey=${YMAPS_APIKEY}` : '';
const YMAPS_API_URL = `https://api-maps.yandex.ru/2.1/?lang=ru_RU${apikey}`;

const baseColor = '#005281'; // 015a8d
const activeColor = '#bc3134'; // ffd649

// TODO:
// ymaps search hints

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private destroy$ = new Subject();
  // private activeSights = new Set<number>();
  private activeSights: number[] = [];
  private mapActiveSights: number[] = [];
  private sightsData?: SightsData;

  private ymaps?: any;
  private map: any;
  private storage: any;
  private clusterer: any;

  initialized$ = new ReplaySubject<void>();

  constructor(
    private windowService: WindowService,
    private documentService: DocumentService,
    // private settingsService: SettingsService,
    private sightsService: SightsService,
  ) {}

  private checkApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.windowService.windowRef.ymaps) {
        resolve();
      } else {
        const script = document.createElement('script');
        script.src = YMAPS_API_URL;
        script.async = true;
        script.onload = (): void => resolve();
        script.onerror = (): void => reject();
        document.body.appendChild(script);
      }
    });
  }

  init(container: HTMLElement, sightsData: SightsData): Observable<void> {
    return new Observable((subscriber) => {
      const completeError = (err?: any): void => {
        // eslint-disable-next-line no-console
        console.error('MapService.init error!', err);
        subscriber.error();
        subscriber.complete();
      };

      this.checkApi()
        .then(() => {
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
            completeError();
          }
        })
        .catch((err) => completeError(err));
    });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initMap(container: HTMLElement, sightsData: SightsData): void {
    this.sightsData = sightsData;

    // Setup map and markers
    this.map = new this.ymaps.Map(container, {
      center: [52.967631, 36.069584],
      // controls: ['geolocationControl', 'zoomControl'],
      zoom: 12,
    });

    this.clusterer = new this.ymaps.Clusterer({
      clusterIconColor: baseColor,
    });

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

    console.log('map:', this.map);
  }

  private setMarkers(update = false): void {
    this.mapActiveSights = [];
    const markers = this.makeMarkers(this.sightsData?.items || []);

    this.clusterer.removeAll();
    this.map.geoObjects.removeAll();

    this.storage = this.ymaps.geoQuery(markers);
    this.clusterer.add(markers);
    this.map.geoObjects.add(this.clusterer);

    // center map
    let needCenter = !update;
    if (update) {
      this.storage.each((mark: any) => {
        const geoObjectState = this.clusterer.getObjectState(mark);
        if (geoObjectState.isShown === false) needCenter = true;
      });
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
        const { title } = item;
        // const url = item.permalink;
        const postId = item.post_id;
        const thumbUrl = item.thumb_url;
        const nested = item.nested?.length
          ? `<p>+ ${item.nested.map((s) => s.title).join('</p><p>')}</p>`
          : '';
        const content = `<header><h3>{{ properties.title }}</h3>${nested}</header>
          ${thumbUrl ? '<img src="{{ properties.thumbUrl }}" />' : ''}`;

        const marker = new this.ymaps.Placemark(
          [lat, lng],
          {
            postId,
            title,
            thumbUrl,
            clusterCaption: title,
            // balloonContent: `${clusterImg}<p><a href="${url}">Перейти на страницу объекта >></a></p>`,
          },
          {
            // preset: 'islands#darkBlueIcon',
            preset: 'islands#Icon',
            iconColor: baseColor,
            balloonContentLayout: this.ymaps.templateLayoutFactory.createClass(
              `<div class="ymc-template">${content}</div>`,
            ),
            hintContentLayout: this.ymaps.templateLayoutFactory.createClass(
              `<div class="ymc-template ymc-hint">${content}</div>`,
            ),
          },
        );

        marker.events.add(['mouseenter', 'balloonopen'], () => {
          // e.get('target').options.set('iconColor', activeColor);
          const index = this.mapActiveSights.indexOf(postId);
          if (index === -1) {
            this.mapActiveSights.push(postId);
            this.sightsService.addActiveSight(postId);
          }
        });

        marker.events.add(['mouseleave', 'balloonclose'], () => {
          // e.get('target').options.set('iconColor', baseColor);
          const index = this.mapActiveSights.indexOf(postId);
          if (index > -1) {
            this.mapActiveSights.splice(index, 1);
            this.sightsService.deleteActiveSight(postId);
          }
        });

        marker.balloon.events.add('click', () => {
          // const { postId } = e.get('target').properties._data;
          this.sightsService.setSightForMore(undefined, postId);
        });

        marker.hint.events.add('click', () => {
          this.sightsService.setSightForMore(undefined, postId);
        });

        markers.push(marker);
      }
    });

    return markers;
  }

  private initMapSubscriptions(): void {
    this.sightsService.activeSights$
      .pipe(takeUntil(this.destroy$))
      .subscribe((activeSights) => {
        // console.log('$$$ this.activeSights:', this.activeSights);
        // console.log('$$$ activeSights:', activeSights);
        if (this.arraysNotEquals(this.activeSights, activeSights) === true) {
          this.colorActiveSights(false);
          this.activeSights = activeSights;
          this.colorActiveSights(true);
        }
      });
  }

  private colorActiveSights(active: boolean): void {
    const color = active ? activeColor : baseColor;

    this.activeSights.forEach((postId) => {
      this.storage.search(`properties.postId = ${postId}`).each((mark: any) => {
        const geoObjectState = this.clusterer.getObjectState(mark);
        if (geoObjectState.isShown) {
          if (geoObjectState.isClustered) {
            geoObjectState.cluster.options.set('clusterIconColor', color);
          } else {
            mark.options.set('iconColor', color);
          }
        }
      });
    });
  }

  update(sightsData: SightsData): void {
    console.log('mapService update...');
    if (this.sightsDataHasChanged(sightsData) === true) {
      console.log('sightsData has changed. LETS ROCK!!');
      this.sightsData = sightsData;
      this.setMarkers(true);
    }
  }

  private sightsDataHasChanged(sightsData: SightsData): boolean {
    if (this.sightsData?.items.length !== sightsData.items.length) return true;

    // const compareFn = (a: number, b: number): number => a - b;
    const ids1 = this.sightsData.items.map((item) => item.post_id); // .sort(compareFn);
    const ids2 = sightsData.items.map((item) => item.post_id); // .sort(compareFn);
    // console.log('ids1:', ids1);
    // console.log('ids2:', ids2);

    return ids1.some((v, i) => v !== ids2[i]);
  }

  private arraysNotEquals(arr1: number[], arr2: number[]): boolean {
    if (arr1.length !== arr2.length) return true;

    const compareFn = (a: number, b: number): number => a - b;
    const sorted1 = arr1.sort(compareFn);
    const sorted2 = arr2.sort(compareFn);

    return sorted1.some((v, i) => v !== sorted2[i]);
  }
}
