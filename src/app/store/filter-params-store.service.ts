import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

import { SimpleStore } from '../core/utils/simple-store';
import { FilterParams, SightId } from '../models/sights.models';

type FilterParamsStoreState = FilterParams | undefined;

@Injectable({
  providedIn: 'root',
})
export class FilterParamsStoreService extends SimpleStore<FilterParamsStoreState> {
  constructor() {
    super(undefined);
  }

  get(): FilterParamsStoreState {
    // console.log('FilterParamsStore get', this.state);
    return this.state;
  }

  update(value: FilterParams): void {
    // console.log('FilterParamsStore update', JSON.stringify(value));
    this.setState(value);
  }

  setSightForMore(value: SightId | undefined): void {
    // console.log('FilterParamsStore setSightForMore', value);
    this.setState({ ...this.state, sightForMore: value });
  }

  sightForMore$: Observable<SightId | undefined> = this.state$.pipe(
    filter((state) => !!state),
    map((state) => state?.sightForMore),
    distinctUntilChanged(),
  );
}
