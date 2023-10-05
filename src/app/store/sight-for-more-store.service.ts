import { Injectable } from '@angular/core';

import { SimpleStore } from '../core/utils/simple-store';
import { SightId } from '../models/sights.models';

@Injectable({
  providedIn: 'root',
})
export class SightForMoreStoreService extends SimpleStore<SightId | undefined> {
  constructor() {
    super(undefined);
  }

  get(): SightId | undefined {
    console.log('get SightForMore', this.state);
    return this.state;
  }

  update(value: SightId | undefined): void {
    this.setState(value);
    console.log('update SightForMore', this.state);
  }
}
