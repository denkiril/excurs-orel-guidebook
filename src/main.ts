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
    // ngZone: 'noop',
  })
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err));

// TODO
// Sights sorting. Default (+) Manual?
// Справка (большой тултип?)
// ОКН от Минкульта +
// SEO на ОКН (SSR) +
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
// egrkn additionalCoordinates - show polygon (_or_ dots) on map on more mode +
// fly to object on map (button near geolocation _or_ onSightForMore) +
// requestEgrknData actual - hack or upd server +
// BUG Double GET /api/sight-links?slugs=orlovskij-kraevedcheskij-muzej on exo_892
// Multi okn_type (okn_type[0] refac)
// images slider
// BUG No search text in search-bar on init +
// BUG Nested sightForMore not marked on map +
// Add sightForMore on init (by url) to map (and list?) +
// BUG Settings from LS ignored if init by "/?sight=" url +
// Show sets (tur, okn, egrkn, etc?) [with anchor?] for sight/sightForMore
