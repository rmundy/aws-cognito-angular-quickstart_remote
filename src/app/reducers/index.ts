import {
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer
} from '@ngrx/store';

// tslint:disable-next-line:no-implicit-dependencies
import { storeFreeze } from 'ngrx-store-freeze';

import { environment } from '../../environments/environment';

export interface AppState {}

export const reducers: ActionReducerMap<AppState> = {};

export const metaReducers: Array<
  MetaReducer<AppState>
> = !environment.production ? [storeFreeze] : [];
