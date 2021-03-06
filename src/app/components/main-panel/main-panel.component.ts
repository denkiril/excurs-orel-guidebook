import {
  Component,
  OnDestroy,
  OnInit,
  ╔ÁmarkDirty as markDirty,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, first, takeUntil } from 'rxjs/operators';

import {
  FilterBlock,
  FilterParams,
  FILTER_BLOCKS,
  GetSightsParams,
  SightData,
  SightsFilterParams,
  SightsService,
} from 'src/app/services/sights.service';
import { SettingsService } from 'src/app/services/settings.service';
import { CustomValidators } from 'src/app/core/custom-validators';

interface SightDataLocal extends SightData {
  active: boolean;
}

@Component({
  selector: 'exogb-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.scss'],
  animations: [
    trigger('openClose', [
      state(
        'opened',
        style({
          maxHeight: '300px',
          opacity: 1,
        }),
      ),
      state(
        'closed',
        style({
          maxHeight: '0',
          opacity: 0,
        }),
      ),
      transition('closed => opened', [animate('400ms ease-in-out')]),
      transition('opened => closed', [animate('300ms ease-in-out')]),
    ]),
  ],
})
export class MainPanelComponent implements OnInit, OnDestroy {
  getSights$ = new Subject();
  private destroy$ = new Subject();

  public readonly filterBlocks: FilterBlock[] = [...FILTER_BLOCKS];

  public form!: FormGroup;
  public sights: SightDataLocal[] = [];
  public sightIdForMore?: number;
  public showServerError = false;
  private limit?: number;
  public sightsFetching = false;
  public sightsFetched = false;

  constructor(
    // private mapService: MapService,
    private sightsService: SightsService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.settingsService.filterParamsInRoute$
      .pipe(first())
      .subscribe((params) => {
        this.initWithFilterParams(params);
      });

    this.sightsService.sightForMore$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.sightIdForMore = data?.sight?.post_id || data?.sightId;
        markDirty(this);
      });

    this.settingsService.startParseQueryParams();

    this.sightsService.activeSights$
      .pipe(takeUntil(this.destroy$))
      .subscribe((activeSights) => {
        this.sights.forEach((sight) => {
          sight.active = activeSights.includes(sight.post_id);
        });
        markDirty(this);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = new FormGroup({
      search: new FormControl(''),
    });

    this.filterBlocks.forEach((block) => {
      this.form.addControl(block.name, new FormControl(block.switchedOn));

      block.groups.forEach((group) => {
        this.form.addControl(
          group.name,
          new FormGroup(
            {},
            group.name === 'okn_category' || group.name === 'okn_type'
              ? CustomValidators.checkedFormGroup
              : Validators.nullValidator,
          ),
        );

        group.controls.forEach((control) => {
          (this.form.get(group.name) as FormGroup).addControl(
            control.name,
            new FormControl(control.value),
          );
        });
      });
    });

    // console.log('init form:', this.form);
  }

  private initWithFilterParams(filterParamsInRoute: FilterParams): void {
    // console.log('initWithFilterParams:', filterParamsInRoute);
    const filterParams =
      this.settingsService.getFilterParams(filterParamsInRoute);

    if (filterParams) {
      if (filterParams.sightsFilterParams) {
        this.updateFilterBlocks(filterParams.sightsFilterParams);
      }
      this.updateForm(filterParams);
    }

    this.settingsService.filterParamsInRoute$
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => this.processFilterParams(params));

    this.getSights$
      .pipe(takeUntil(this.destroy$), debounceTime(300))
      .subscribe(() => {
        this.getSights();
        markDirty(this);
      });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // console.log('form valueChanges$', this.form.value);
      this.updateFilterParams();
      // -> filterParamsInRoute -> getSights...
    });

    this.emitGetSights();
  }

  private updateFilterBlocks(sightsFilterParams: SightsFilterParams): void {
    // console.log('updateFilterBlocks');
    this.filterBlocks.forEach((block) => {
      block.opened = sightsFilterParams[block.name]?.opened ?? block.opened;
    });
  }

  private updateForm(filterParams: FilterParams): void {
    // console.log('updateForm');
    const options = { emitEvent: false };
    const { sightsFilterParams, search, sightForMore } = filterParams;

    if (sightsFilterParams) {
      this.filterBlocks.forEach((block) => {
        const blockParams = sightsFilterParams[block.name];
        this.form
          .get(block.name)
          ?.setValue(blockParams?.switchedOn ?? Boolean(blockParams), options);

        if (blockParams) {
          block.groups.forEach((group) => {
            const groupParams =
              blockParams.groups && blockParams.groups[group.name];

            group.controls.forEach((control) => {
              this.form
                .get(group.name)
                ?.get(control.name)
                ?.setValue(
                  Boolean(groupParams && groupParams[control.name]),
                  options,
                );
            });
          });
        }
      });
    }

    this.form.patchValue({ search: search || '' }, options);

    this.sightsService.setSightForMore(
      undefined,
      sightForMore ? Number(sightForMore) : undefined,
      false,
    );
  }

  private processFilterParams(filterParams: FilterParams): void {
    // console.log('filterParamsInRoute$', filterParams);
    this.updateForm(filterParams);
    this.emitGetSights();
  }

  public animationDone(filterBlock: FilterBlock): void {
    // the toState, fromState and totalTime data is accessible from the event variable
    filterBlock.showed = filterBlock.opened;
    markDirty(this);
  }

  public onOpenedChange(opened: boolean, filterBlock: FilterBlock): void {
    // console.log('onOpenedChange');
    filterBlock.opened = opened;
    this.updateFilterParams();
  }

  public emitGetSights(): void {
    this.getSights$.next();
  }

  private getSights(): void {
    if (this.form.invalid) return;

    const params: GetSightsParams = {
      limit: this.limit,
      filterParams: this.buildFilterParams(),
    };

    this.sightsFetching = true;
    markDirty(this);

    this.sightsService
      .getSights(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          // console.log('sightsService data:', data);
          this.sights = data.items.map((item) => ({ ...item, active: false }));
          this.sightsFetching = false;
          this.sightsFetched = true;
          this.showServerError = false;
          markDirty(this);
        },
        (error) => {
          // console.error('!! Error:', error);
          this.sightsFetching = false;
          if (!error.ok) this.showServerError = true;
          markDirty(this);
        },
      );
  }

  private buildFilterParams(): FilterParams {
    return this.settingsService.buildFilterParams(
      this.filterBlocks,
      this.form.value,
    );
  }

  private updateFilterParams(): void {
    // console.log('updateFilterParams');
    this.settingsService.setFilterParams(this.buildFilterParams());
  }

  // public setSightForMore(sight?: SightData): void {
  //   this.sightsService.setSightForMore(sight);
  // }

  public trackById(_index: number, item: SightData): number {
    return item.post_id;
  }

  public onCardHover(sight: SightDataLocal, hover = true): void {
    if (hover) this.sightsService.addActiveSight(sight.post_id);
    else this.sightsService.deleteActiveSight(sight.post_id);
  }
}
