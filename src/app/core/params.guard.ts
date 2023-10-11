import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

export const GB_QUERY_PARAMS_KEYS = <const>['filter', 'search', 'sight'];

type GBQueryParamsKey = typeof GB_QUERY_PARAMS_KEYS[number];

export type GBQueryParams = Partial<Record<GBQueryParamsKey, string>>;

@Injectable({
  providedIn: 'root',
})
export class ParamsGuard  {
  constructor(private readonly router: Router) {}

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

    // if (
    //   queryParamsKeys.length === 0 ||
    //   (newQueryParams !== null && Object.keys(newQueryParams).length === 0)
    // ) {
    //   newQueryParams = { filter: 'tur:main,mus.okn:f;a,g,h,i' };
    // }
    if (newQueryParams) console.log('newQueryParams', newQueryParams);

    return newQueryParams
      ? this.router.createUrlTree([], {
          queryParams: newQueryParams,
        })
      : true;
  }
}
