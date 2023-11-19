import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

interface AppConfig {
  production: boolean;
  VERSION: string;
  BASE_URL: string;
  API_URL: string;
  YMAPS_APIKEY: string;
  ASSETS_URL: string;
  IS_DEV: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private _config: AppConfig = { ...environment };

  get config(): AppConfig {
    return this._config;
  }
}
