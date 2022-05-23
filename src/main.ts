import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

console.info(`Version -> ${environment.VERSION}`);
console.log('environment:', environment);

if (environment.production) {
  enableProdMode();
}

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    ngZone: 'noop',
  })
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err));
