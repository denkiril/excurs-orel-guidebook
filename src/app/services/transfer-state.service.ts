import { Injectable, TransferState, makeStateKey } from '@angular/core';

import {
  SightData,
  SightDataExt,
  SightResponseItem,
} from '../models/sights.models';
import { EgrknResponse } from '../features/egrkn/egrkn.model';

const SIGHTS_LIST_STATE_KEY = makeStateKey<SightData[]>('sights-list');
const SIGHT_FOR_MORE_STATE_KEY = makeStateKey<SightDataExt>('sight-for-more');
const SIGHTS_STATE_KEY = makeStateKey<SightResponseItem[]>('sights');
const EGRKN_STATE_KEY = makeStateKey<EgrknResponse>('egrkn');

@Injectable({
  providedIn: 'root',
})
export class TransferStateService {
  constructor(private readonly transferState: TransferState) {}

  setSightsList(value: SightData[]): void {
    this.transferState.set(SIGHTS_LIST_STATE_KEY, value);
  }

  getSightsList(): SightData[] {
    return this.transferState.get(SIGHTS_LIST_STATE_KEY, []);
  }

  setSightForMore(value: SightDataExt): void {
    this.transferState.set(SIGHT_FOR_MORE_STATE_KEY, value);
  }

  getSightForMore(): SightDataExt | undefined {
    return this.transferState.get(SIGHT_FOR_MORE_STATE_KEY, undefined);
  }

  setSights(value: SightResponseItem[]): void {
    this.transferState.set(SIGHTS_STATE_KEY, value);
  }

  getSights(): SightResponseItem[] {
    return this.transferState.get(SIGHTS_STATE_KEY, []);
  }

  setEgrkn(value: EgrknResponse): void {
    this.transferState.set(EGRKN_STATE_KEY, value);
  }

  getEgrkn(): EgrknResponse | undefined {
    return this.transferState.get(EGRKN_STATE_KEY, undefined);
  }
}
