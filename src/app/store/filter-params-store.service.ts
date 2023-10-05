import { Injectable } from '@angular/core';

import { SimpleStore } from '../core/utils/simple-store';
import { FilterParams, SightId } from '../models/sights.models';

@Injectable({
  providedIn: 'root',
})
export class FilterParamsStoreService extends SimpleStore<FilterParams> {
  constructor() {
    super({});
  }

  get(): FilterParams {
    // console.log('FilterParamsStore get', this.state);
    return this.state;
  }

  update(value: FilterParams): void {
    // console.log('FilterParamsStore update', value);
    this.setState(value);
  }

  setSightForMore(value: SightId | undefined): void {
    // console.log('FilterParamsStore setSightForMore', value);
    this.setState({ ...this.state, sightForMore: value });
  }
}
