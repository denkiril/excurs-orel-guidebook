import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DocumentService, MediaSize } from './document.service';
import { SightData, SightsData } from './sights.service';
import { WindowService } from './window.service';

const YMAPS_API_URL =
  'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=6ebdbbc2-3779-4216-9d88-129e006559bd';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private destroy$ = new Subject();
  private ymaps?: any;

  initialized$ = new ReplaySubject();

  constructor(
    private windowService: WindowService,
    private documentService: DocumentService,
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

  private initMap(container: HTMLElement, sightsData: SightsData): any {
    const map = new this.ymaps.Map(container, {
      center: [52.967631, 36.069584],
      // controls: ['geolocationControl', 'zoomControl'],
      zoom: 12,
    });

    map.markers = this.makeMarkers(sightsData.items);
    map.markers.forEach((mark: any) => map.geoObjects.add(mark));

    this.documentService.getMediaSize$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mediaSize) => {
        console.log('mediaSize', mediaSize);
        if (mediaSize === MediaSize.Mobile) {
          // map.behaviors.disable('scrollZoom');
          map.controls.remove('zoomControl');
        } else {
          map.controls.add('zoomControl');
        }
      });

    console.log('map:', map);
    return map;
  }

  private makeMarkers(items: SightData[]): any[] {
    const markers: any[] = [];

    items.forEach((item) => {
      if (item.geolocation) {
        const { lat, lng } = item.geolocation;
        const { title } = item;
        const url = item.permalink;
        // const clusterImg = thumbUrl ? `<img src="${thumbUrl}" />` : '';

        const marker = new this.ymaps.Placemark(
          [lat, lng],
          {
            postId: item.post_id,
            url,
            title,
            thumbUrl: item.thumb_url,
            clusterCaption: title,
            // balloonContent: `${clusterImg}<p><a href="${url}">Перейти на страницу объекта >></a></p>`,
          },
          {
            // preset: 'islands#darkBlueIcon',
            preset: 'islands#Icon',
            iconColor: '#005281',
            // balloonContentLayout: BalloonLayoutClass,
            // hintContentLayout: HintLayoutClass,
          },
        );

        markers.push(marker);
      }
    });

    return markers;
  }
}
