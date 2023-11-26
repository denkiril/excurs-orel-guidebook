import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';

import { SightDataExt } from '../models/sights.models';
import { AppState } from './state/app.state';
import { resetSightForMore, setSightForMore } from './actions';
import { FilterParamsStoreService } from './filter-params-store.service';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  constructor(
    private readonly store: Store<AppState>,
    private readonly filterParamsStore: FilterParamsStoreService,
  ) {
    this.filterParamsStore.sightForMore$
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        // console.log('[StoreService] filterParamsStore.setSightForMore$', value);
        if (!value) this.store.dispatch(resetSightForMore());
      });
  }

  select$(prop: keyof AppState) {
    return this.store.select(prop);
  }

  setSightForMore(sightForMore: SightDataExt): void {
    // console.log('[StoreService] setSightForMore', sightForMore.id);
    this.store.dispatch(setSightForMore({ sightForMore }));
  }
}
