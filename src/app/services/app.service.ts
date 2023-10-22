import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from 'src/environments/environment';

const { production, ASSETS_URL, IS_DEV } = environment;

@Injectable({
  providedIn: 'root',
})
export class AppService {
  readonly isServer = isPlatformServer(this.platformId);

  readonly isDev = !production || IS_DEV;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  getAssetsUrl(): string {
    return this.isServer || production ? ASSETS_URL : '/assets/';
  }
}
