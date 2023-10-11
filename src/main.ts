import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

console.info(`Version -> ${environment.VERSION}`);
// console.log('environment:', environment);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    ngZone: 'noop',
  })
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err));

// TODO
// Sights sorting. Default (+) Manual?
// Справка (большой тултип?)
// ОКН от Минкульта +
// SEO на ОКН (SSR)
// SEO для /guidebook/?filter=tur:main,mus.okn:f;a,g,h,i и т.п. (?)
// тех. метрики, логирование
// Lazy loading sights (pagination)
// nested - from back
// Свой набор достопр-тей: избранное, в роуте
// Лого адаптировать
// ymaps search hints
// Loader for map and ymaps onerror reloading +
// Фильтрация по имени (вхождению строки)?
// Show images setting ?
// Офлайн-режим ?
// webp from api data ?
// Фото ЭО на карте (pagination)
// fantom active bug (click marker, click checkbox) +
// localStorage unavailable bug +
// custom user-scalable (a11y)?
// search & mobile keyboard bug +
// active on init (by route) not highlighted on map +
// route changing not trigger fetch +
// switch off "tur" when all checkboxes off (UI and route)? 3rd state of toggle?
// egrkn additionalCoordinates - show polygon on map on more mode
// fly to object on map (button near geolocation)
// requestEgrknData actual - hack or upd server
