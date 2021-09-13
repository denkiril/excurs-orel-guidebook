import { Injectable } from '@angular/core';
import { SightsFilterParams } from './sights.service';

const FILTER_PARAMS_LS_ITEM = 'sightsFilterParams';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  // constructor() {}

  public getFilterParams(): SightsFilterParams | undefined {
    console.log('getFilterParams');
    let filterParams: SightsFilterParams | undefined;
    const filterParamsStr = localStorage.getItem(FILTER_PARAMS_LS_ITEM);
    if (filterParamsStr) {
      try {
        filterParams = JSON.parse(filterParamsStr);
      } finally {
        //
      }
    }

    return filterParams;
  }

  public setFilterParams(filterParams: SightsFilterParams): void {
    console.log('setFilterParams');
    localStorage.setItem(FILTER_PARAMS_LS_ITEM, JSON.stringify(filterParams));
  }
}
