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
// Sights sorting. Default? Manual?
// Справка (большой тултип?)
// ОКН от Минкульта
// SEO на ОКН (SSR)
// тех. метрики
// Lazy loading sights (pagination)
// nested - from back
// Свой набор достопр-тей: избранное, в роуте
// Лого адаптировать
// ymaps search hints
// Loader for map ?
// Фильтрация по имени (вхождению строки)?
// Show images setting ?
// Офлайн-режим ?
// webp from api data ?
// Фото ЭО на карте (pagination)
// fantom active bug (click marker, click checkbox) +
// localStorage unavailable bug +
// custom user-scalable (a11y)?
// search & mobile keyboard bug +
// ! active nested not highlighted on map, also in-route active
