import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

type RequestParams =
  | HttpParams
  | {
      [param: string]:
        | string
        | number
        | boolean
        | ReadonlyArray<string | number | boolean>;
    };

const { API_URL, MKRF_OPENDATA_APIKEY } = environment;

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  constructor(private readonly http: HttpClient) {}

  getApi<T>(path: string, params?: RequestParams): Observable<T> {
    return this.http.get<T>(API_URL + path, { params });
  }

  getUrl<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  getMkrfOpendata<T>(url: string): Observable<T> {
    return this.http.get<T>(url, {
      headers: { 'X-API-KEY': MKRF_OPENDATA_APIKEY },
    });
  }
}
