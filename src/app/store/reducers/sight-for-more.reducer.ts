import { createReducer, on } from '@ngrx/store';

import { SightForMoreState } from '../state/app.state';
import {
  setSightForMore,
  resetSightForMore,
} from '../actions/sight-for-more.actions';

export const initialState: SightForMoreState = {
  sightForMore: undefined,
};

export const sightForMoreReducer = createReducer(
  initialState,
  on(setSightForMore, (state, { sightForMore }) => ({
    ...state,
    sightForMore,
  })),
  on(resetSightForMore, () => initialState),
);
