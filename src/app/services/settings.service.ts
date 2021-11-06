import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import {
  FilterParams,
  FILTER_BLOCKS,
  SightsFilterParams,
} from './sights.service';

const FILTER_PARAMS_LS_ITEM = 'sightsFilterParams';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  public filterParamsInRoute: Subject<SightsFilterParams> =
    new Subject<SightsFilterParams>();

  // groupNames = { fb2: ['category', 'type'], }
  groupNames: Record<string, string[]> = Object.fromEntries(
    FILTER_BLOCKS.map((block) => [
      block.name,
      block.groups.map((group) => group.name),
    ]),
  );

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.parseQueryParams(params);
    });
  }

  public getFilterParams(): SightsFilterParams | undefined {
    console.log('getFilterParams');
    // console.log('snapshot:', this.activatedRoute.snapshot);
    let sightsFilterParams: SightsFilterParams | undefined;
    // queryParams or localStorage? TODO
    // queryParams:
    // ...
    // else localStorage:
    const filterParamsStr = localStorage.getItem(FILTER_PARAMS_LS_ITEM);
    if (filterParamsStr) {
      try {
        sightsFilterParams = JSON.parse(filterParamsStr);
      } finally {
        if (sightsFilterParams) {
          this.setFilterParams({ sightsFilterParams }, false);
        }
      }
    }

    return sightsFilterParams;
  }

  public setFilterParams(
    filterParams: FilterParams,
    setLS = true,
    setQP = true,
  ): void {
    console.log('setFilterParams (setLS, setQP):', setLS, setQP, filterParams);
    const { sightsFilterParams } = filterParams;

    if (setLS) {
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

      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
      });
    }
  }

  private parseQueryParams(queryParams: Params): void {
    console.log('parseQueryParams:', queryParams);
    const filterParams: SightsFilterParams = {};

    if (queryParams.filter && typeof queryParams.filter === 'string') {
      const blocks = queryParams.filter.split('.');
      blocks.forEach((block) => {
        const [blockName, blockBody] = block.split(':');
        filterParams[blockName] = { groups: {} };

        blockBody.split(';').forEach((group, index) => {
          if (group) {
            const groupName = this.groupNames[blockName][index];
            filterParams[blockName].groups[groupName] =
              this.parseTruthyObj(group);
          }
        });
      });
    }

    this.filterParamsInRoute.next(filterParams);
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
