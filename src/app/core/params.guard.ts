import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

export const GB_QUERY_PARAMS_KEYS = <const>['filter', 'search', 'sight'];

type GBQueryParamsKey = typeof GB_QUERY_PARAMS_KEYS[number];

export type GBQueryParams = Partial<Record<GBQueryParamsKey, string>>;

@Injectable({
  providedIn: 'root',
})
export class ParamsGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot,
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const { queryParams } = route;
    const queryParamsKeys = Object.keys(queryParams);
    const allowedParamsKeys = queryParamsKeys.filter((key: string) =>
      GB_QUERY_PARAMS_KEYS.includes(key as GBQueryParamsKey),
    );

    const newQueryParams: GBQueryParams | null =
      allowedParamsKeys.length < queryParamsKeys.length
        ? allowedParamsKeys.reduce((obj: any, key) => {
            obj[key] = queryParams[key];
            return obj;
          }, {})
        : null;

    return newQueryParams
      ? this.router.createUrlTree([], {
          queryParams: newQueryParams,
        })
      : true;
  }
}
