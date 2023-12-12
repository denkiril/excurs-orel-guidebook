import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';

type RequestParams =
  | HttpParams
  | {
      [param: string]:
        | string
        | number
        | boolean
        | ReadonlyArray<string | number | boolean>;
    };

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private readonly apiUrl = this.configService.config.API_URL;
  private mkrfOpendataApiKey = '';

  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  setEnvVars(mkrfOpendataApiKey: string): void {
    this.mkrfOpendataApiKey = mkrfOpendataApiKey;
  }

  getApi<T>(path: string, params?: RequestParams): Observable<T> {
    const url = this.apiUrl + path;
    this.loggerService.log(`getApi ${url}`);

    return this.http.get<T>(url, { params }).pipe(
      tap({
        error: (err) => this.loggerService.error(`getApi ${url}`, err),
      }),
    );
  }

  getUrl<T>(url: string): Observable<T> {
    this.loggerService.log(`getUrl ${url}`);

    return this.http.get<T>(url).pipe(
      tap({
        error: (err) => this.loggerService.error(`getUrl ${url}`, err),
      }),
    );
  }

  getMkrfOpendata<T>(url: string): Observable<T> {
    this.loggerService.log(`getUrl (X-API-KEY) ${url}`);

    return this.http
      .get<T>(url, {
        headers: {
          'X-API-KEY': this.mkrfOpendataApiKey,
        },
      })
      .pipe(
        tap({
          error: (err) =>
            this.loggerService.error(`getUrl (X-API-KEY) ${url}`, err),
        }),
      );
  }
}
