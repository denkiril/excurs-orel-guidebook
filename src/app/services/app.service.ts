import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  readonly isServer = isPlatformServer(this.platformId);

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  getAssetsUrl(): string {
    return this.isServer || environment.production
      ? environment.ASSETS_URL
      : '/assets/';
  }
}
