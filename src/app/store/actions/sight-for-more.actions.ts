import { createAction, props } from '@ngrx/store';
import { SightDataExt } from 'src/app/models/sights.models';

export const setSightForMore = createAction(
  '[SightForMore] Set',
  props<{ sightForMore: SightDataExt }>(),
);
export const resetSightForMore = createAction('[SightForMore] Reset');
