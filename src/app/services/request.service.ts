import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
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

const { API_URL } = environment;

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private mkrfOpendataApiKey = '';

  constructor(
    private readonly http: HttpClient,
    private readonly loggerService: LoggerService,
  ) {}

  setEnvVars(mkrfOpendataApiKey: string): void {
    this.mkrfOpendataApiKey = mkrfOpendataApiKey;
  }

  getApi<T>(path: string, params?: RequestParams): Observable<T> {
    const url = API_URL + path;
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
