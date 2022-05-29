import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
  FilterBlock,
  FilterParams,
  FILTER_BLOCKS,
  SightsFilterParams,
} from './sights.service';

type FilterQueryParams = Partial<{
  filter: string;
  search: string;
  sight: string;
}>;

const FILTER_PARAMS_LS_ITEM = 'sightsFilterParams';

// TODO
// browser navigate with skipParse bug

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private skipParse = false;
  filterParamsInRoute$ = new Subject<FilterParams>();

  groupNames: Record<string, string[]> = Object.fromEntries(
    FILTER_BLOCKS.map((block) => [
      block.name,
      block.groups.map((group) => group.name),
    ]),
  );

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  public startParseQueryParams(): void {
    // console.log('startParseQueryParams');
    this.activatedRoute.queryParams
      .pipe(debounceTime(300))
      .subscribe((params) => {
        // console.log('upd queryParams... skipParse:', this.skipParse);
        if (!this.skipParse) this.parseQueryParams(params);
        this.skipParse = false;
        // console.log('skipParse = false');
      });
  }

  public getFilterParams(
    filterParamsInRoute: FilterParams,
  ): FilterParams | undefined {
    // console.log('getFilterParams', filterParamsInRoute);
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
            // console.log('define... filterParams:', filterParams);
            // console.log('define... sightsParamsLS:', sightsParamsLS);
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
    // console.log('setFilterParams (setLS, setQP):', setLS, setQP, filterParams);
    const sightsFilterParams = filterParams.sightsFilterParams || {};

    if (setLS && Object.keys(sightsFilterParams).length) {
      localStorage.setItem(
        FILTER_PARAMS_LS_ITEM,
        JSON.stringify(sightsFilterParams),
      );
    }

    if (setQP) {
      const curQueryParams = this.activatedRoute.snapshot.queryParams;
      const queryParams: Params = {};
      const blockNames = Object.keys(sightsFilterParams);
      // console.log('/// curQueryParams:', curQueryParams);

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

      queryParams.sight = curQueryParams.sight || null;

      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
      });
    }
  }

  private parseQueryParams(queryParams: FilterQueryParams): void {
    // console.log('parseQueryParams:', queryParams);
    const filterParams: FilterParams = {};
    const sightsFilterParams: SightsFilterParams = {};

    if (queryParams.filter) {
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
      filterParams.sightForMore = queryParams.sight;
    }

    // console.log('filterParamsInRoute$.next', filterParams);
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

  public buildFilterParams(
    filterBlocks: FilterBlock[],
    formValue: any,
  ): FilterParams {
    // console.log('--- buildFilterParams formValue:', formValue);
    const filterParams: FilterParams = {};
    const sightsFilterParams: SightsFilterParams = {};

    filterBlocks.forEach((block) => {
      sightsFilterParams[block.name] = {
        switchedOn: formValue[block.name],
        opened: block?.opened ?? false,
        groups: Object.fromEntries(
          block.groups.map((group) => [group.name, formValue[group.name]]),
        ),
      };
    });

    if (Object.keys(sightsFilterParams).length) {
      filterParams.sightsFilterParams = sightsFilterParams;
    }

    if (formValue.search) {
      filterParams.search = formValue.search;
    }

    return filterParams;
  }

  public setQueryParam(key: string, value: any): void {
    // console.log('setQueryParam', key, value);

    this.skipParse = true;
    // console.log('skipParse = true');

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { [key]: value || null },
      queryParamsHandling: 'merge',
      // skipLocationChange: true,
      // state: { skip: true },
    });
  }
}
