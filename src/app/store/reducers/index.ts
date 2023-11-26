import { ActionReducerMap } from '@ngrx/store';
import { sightForMoreReducer } from './sight-for-more.reducer';
import { AppState } from '../state/app.state';

export const reducers: ActionReducerMap<AppState> = {
  sightForMore: sightForMoreReducer,
};
