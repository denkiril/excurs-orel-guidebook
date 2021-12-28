import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  FilterParams,
  FILTER_BLOCKS,
  SightsFilterParams,
} from './sights.service';

// export interface FilterParamsConfig {
//   filterParams?: FilterParams;
//   setLS?: boolean;
//   setQP?: boolean;
// }

const FILTER_PARAMS_LS_ITEM = 'sightsFilterParams';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public filterParamsInRoute$ = new Subject<FilterParams>();

  // groupNames = { fb2: ['category', 'type'], }
  groupNames: Record<string, string[]> = Object.fromEntries(
    FILTER_BLOCKS.map((block) => [
      block.name,
      block.groups.map((group) => group.name),
    ]),
  );

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  public startParseQueryParams(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.parseQueryParams(params);
    });
  }

  public getFilterParams(
    filterParamsInRoute: FilterParams,
  ): FilterParams | undefined {
    console.log('getFilterParams', filterParamsInRoute);
    // queryParams or localStorage...
    let filterParams: FilterParams | undefined;
    if (Object.keys(filterParamsInRoute).length) {
      filterParams = filterParamsInRoute;
    }

    const filterParamsStr = localStorage.getItem(FILTER_PARAMS_LS_ITEM);
    let sightsParamsLS: SightsFilterParams | undefined;
    if (filterParamsStr) {
      try {
        sightsParamsLS = JSON.parse(filterParamsStr);
      } finally {
        if (sightsParamsLS) {
          if (!filterParams) {
            filterParams = { sightsFilterParams: sightsParamsLS };
          } else {
            console.log('define... filterParams:', filterParams);
            console.log('define... sightsParamsLS:', sightsParamsLS);
            const sightsFilterParams = filterParams.sightsFilterParams || {};

            Object.keys(sightsFilterParams).forEach((key) => {
              const param = sightsParamsLS && sightsParamsLS[key];
              if (param) {
                sightsFilterParams[key].opened = param.opened;
                sightsFilterParams[key].switchedOn = param.switchedOn;
              }
            });
          }

          this.setFilterParams(filterParams, false);
        }
      }
    }

    return filterParams;
  }

  public setFilterParams(
    filterParams: FilterParams,
    setLS = true,
    setQP = true,
  ): void {
    console.log('setFilterParams (setLS, setQP):', setLS, setQP, filterParams);
    const sightsFilterParams = filterParams.sightsFilterParams || {};

    if (setLS && Object.keys(sightsFilterParams).length) {
      localStorage.setItem(
        FILTER_PARAMS_LS_ITEM,
        JSON.stringify(sightsFilterParams),
      );
    }

    if (setQP) {
      const queryParams: Params = {};
      const blockNames = Object.keys(sightsFilterParams);

      if (blockNames.length) {
        const blocks: string[] = [];
        blockNames.forEach((blockName) => {
          if (sightsFilterParams[blockName].switchedOn) {
            const blockBody = Object.values(
              sightsFilterParams[blockName].groups,
            )
              .map((group) => this.stringifyTruthyObj(group))
              .join(';');
            blocks.push(`${blockName}:${blockBody}`);
          }
        });
        // queryParams.filter = 'fb2:fed,reg;arc,aig,his,art.';
        if (blocks.length) queryParams.filter = blocks.join('.');
      }

      if (filterParams.search) {
        queryParams.search = filterParams.search;
      }

      if (filterParams.sightId) {
        queryParams.sight = filterParams.sightId;
      }

      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
      });
    }
  }

  private parseQueryParams(queryParams: Params): void {
    console.log('parseQueryParams:', queryParams);
    const filterParams: FilterParams = {};
    const sightsFilterParams: SightsFilterParams = {};

    if (queryParams.filter && typeof queryParams.filter === 'string') {
      const blocks = queryParams.filter.split('.');
      blocks.forEach((block) => {
        const [blockName, blockBody] = block.split(':');
        sightsFilterParams[blockName] = { groups: {} };

        blockBody.split(';').forEach((group, index) => {
          if (group) {
            const groupName = this.groupNames[blockName][index];
            sightsFilterParams[blockName].groups[groupName] =
              this.parseTruthyObj(group);
          }
        });
      });
    }

    if (Object.keys(sightsFilterParams).length) {
      filterParams.sightsFilterParams = sightsFilterParams;
    }

    if (queryParams.search) {
      filterParams.search = queryParams.search;
    }

    if (queryParams.sight) {
      filterParams.sightId = Number(queryParams.sight);
    }

    console.log('filterParamsInRoute$.next', filterParams);
    this.filterParamsInRoute$.next(filterParams);
  }

  private stringifyTruthyObj(obj?: Record<string, boolean>): string {
    if (!obj) return '';

    return Object.keys(obj)
      .filter((key) => obj[key])
      .join(',');
  }

  private parseTruthyObj(str: string): Record<string, boolean> {
    return Object.fromEntries(str.split(',').map((key) => [key, true]));
  }
}
