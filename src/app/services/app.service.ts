import { isPlatformServer } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';

import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly isProduction = this.configService.config.production;
  private readonly essetsUrl = this.configService.config.ASSETS_URL;

  readonly isServer = isPlatformServer(this.platformId);

  readonly isDev = !this.isProduction || this.configService.config.IS_DEV;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly configService: ConfigService,
  ) {}

  getAssetsUrl(): string {
    return this.isServer || this.isProduction ? this.essetsUrl : '/assets/';
  }
}
