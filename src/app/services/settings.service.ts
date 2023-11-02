import { Injectable } from '@angular/core';
import { ActivatedRoute, QueryParamsHandling, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { GBQueryParams } from '../core/params.guard';
import {
  FilterParams,
  SightsFilterParams,
  FilterBlock,
} from '../models/sights.models';
import { FILTER_BLOCKS } from '../models/sights.constants';
import { FILTER_PARAMS_PRESETS } from '../models/settings.constants';
import { FilterParamsStoreService } from '../store/filter-params-store.service';
import { SeoService } from './seo.service';
import { StorageService } from './storage.service';

const FILTER_PARAMS_LS_ITEM = 'sightsFilterParams';

const GROUP_NAMES: Record<string, string[]> = Object.fromEntries(
  FILTER_BLOCKS.map((block) => [
    block.name,
    block.groups.map((group) => group.name),
  ]),
);

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly filterParamsStore: FilterParamsStoreService,
    private readonly seoService: SeoService,
    private readonly storageService: StorageService,
  ) {}

  getFilterBlocks(): FilterBlock[] {
    return [...FILTER_BLOCKS];
  }

  startParseQueryParams$(): Observable<FilterParams> {
    // console.log('startParseQueryParams$...');
    return new Observable((subscriber) => {
      this.activatedRoute.queryParams
        .pipe(debounceTime(100))
        .subscribe((params) => {
          // console.log('>> startParseQueryParams$ next >');
          subscriber.next(this.parseQueryParams(params));
        });
    });
  }

  getFilterParams(filterParamsInRoute: FilterParams): FilterParams | undefined {
    // console.log('getFilterParams', filterParamsInRoute);
    // queryParams or localStorage...
    let filterParams: FilterParams | undefined;
    if (Object.keys(filterParamsInRoute).length) {
      filterParams = filterParamsInRoute;
    }

    const filterParamsStr = this.storageService.getItem(FILTER_PARAMS_LS_ITEM);
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

  setFilterParams(
    filterParams: FilterParams,
    setLS = true,
    setQP = true,
  ): void {
    // console.log('setFilterParams (setLS, setQP):', setLS, setQP, filterParams);
    const sightsFilterParams = filterParams.sightsFilterParams || {};

    if (setLS && Object.keys(sightsFilterParams).length) {
      this.storageService.setItem(
        FILTER_PARAMS_LS_ITEM,
        JSON.stringify(sightsFilterParams),
      );
    }

    if (setQP) {
      const blockNames = Object.keys(sightsFilterParams);
      const blocks: string[] = [];

      if (blockNames.length) {
        blockNames.forEach((blockName) => {
          if (sightsFilterParams[blockName].switchedOn) {
            const blockBody = Object.values(
              sightsFilterParams[blockName].groups,
            )
              .map((group) => this.stringifyTruthyObj(group))
              .filter(Boolean)
              .join(';');

            blocks.push(`${blockName}:${blockBody}`);
          }
        });
        // filter = 'tur:main,mus.okn:f,r,m,v;a,g,h,i;go';
      }

      const paramsStr = blocks.length ? blocks.join('.') : undefined;
      const preset = FILTER_PARAMS_PRESETS.find(
        (item) => item.paramsStr === paramsStr,
      );

      this.setGBQueryParams({
        filter: preset?.value ?? paramsStr,
        search: filterParams.search,
        sight: this.filterParamsStore.get().sightForMore,
      });
    }
  }

  setGBQueryParams(
    queryParams: GBQueryParams,
    queryParamsHandling?: QueryParamsHandling,
  ): void {
    // console.log('/// setGBQueryParams', queryParams);
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams,
      queryParamsHandling,
    });
  }

  private parseQueryParams(queryParams: GBQueryParams): FilterParams {
    // console.log('parseQueryParams:', queryParams);
    const { filter, search, sight } = queryParams;

    const preset = FILTER_PARAMS_PRESETS.find((item) => item.value === filter);

    const sightsFilterParams: SightsFilterParams =
      preset?.params ?? this.getParsedFilterParams(filter);

    const filterParams: FilterParams = {
      sightsFilterParams: Object.keys(sightsFilterParams).length
        ? sightsFilterParams
        : undefined,
      search,
      sightForMore: sight,
    };

    // console.log('parseQueryParams result:', filterParams);
    this.filterParamsStore.update(filterParams);
    this.seoService.updateSeoParams(
      preset?.seoTitle,
      preset?.seoDescription,
      preset?.seoCanonicalParamsStr,
    );

    return filterParams;
  }

  private getParsedFilterParams(
    filter: string | undefined,
  ): SightsFilterParams {
    if (!filter) return {};

    const sightsFilterParams: SightsFilterParams = {};
    const blocks = filter.split('.');
    blocks.forEach((block) => {
      const [blockName, blockBody] = block.split(':');
      sightsFilterParams[blockName] = { groups: {} };

      blockBody.split(';').forEach((group, index) => {
        if (group) {
          const groupName = GROUP_NAMES[blockName][index];
          sightsFilterParams[blockName].groups[groupName] =
            this.parseTruthyObj(group);
        }
      });
    });

    return sightsFilterParams;
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

  buildFilterParams(filterBlocks: FilterBlock[], formValue: any): FilterParams {
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
}
