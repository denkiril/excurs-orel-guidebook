import { SightDataExt } from 'src/app/models/sights.models';

export interface SightForMoreState {
  sightForMore: SightDataExt | undefined;
}

export interface AppState {
  sightForMore: SightForMoreState;
}
