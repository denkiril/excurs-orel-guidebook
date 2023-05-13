import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ɵmarkDirty as markDirty,
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
  SightData,
  FilterBlock,
  FILTER_BLOCKS,
  FilterParams,
  SightsFilterParams,
  GetSightsParams,
  SightId,
} from 'src/app/models/sights.models';
import { SightsService } from 'src/app/services/sights.service';
import { SettingsService } from 'src/app/services/settings.service';
import { CustomValidators } from 'src/app/core/custom-validators';
import { LoggerService } from 'src/app/services/logger.service';
import { WindowService } from 'src/app/services/window.service';
import { ActiveSightsService } from 'src/app/services/active-sights.service';
import { FilterParamsStoreService } from 'src/app/store/filter-params-store.service';

interface SightDataLocal extends SightData {
  active?: boolean;
}

const DOT = ' .';

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
  @Output() searchInputFocused = new EventEmitter<void>();

  getSights$ = new Subject();
  private readonly destroy$ = new Subject();

  readonly filterBlocks: FilterBlock[] = [...FILTER_BLOCKS];

  form!: FormGroup;
  sights: SightDataLocal[] = [];
  showServerError = false;
  private readonly limit?: number;
  sightsFetching = false;
  sightsFetched = false;
  showEgrknError = false;
  sightsIndicator = '';
  private intervalID: any;
  private cachedFormValue: any = {};
  private activeSights: SightId[] = [];

  constructor(
    private readonly windowService: WindowService,
    private readonly loggerService: LoggerService,
    private readonly sightsService: SightsService,
    private readonly activeSightsService: ActiveSightsService,
    private readonly settingsService: SettingsService,
    private readonly filterParamsStore: FilterParamsStoreService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.settingsService
      .startParseQueryParams$()
      .pipe(first(), takeUntil(this.destroy$))
      .subscribe((params) => {
        this.initWithFilterParams(params);
      });

    this.activeSightsService.activeSights$
      .pipe(takeUntil(this.destroy$))
      .subscribe((activeSights) => {
        this.activeSights = activeSights;
        this.updateSightsActive();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.intervalID) {
      this.windowService.windowRef.clearInterval(this.intervalID);
    }
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

    this.filterParamsStore.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => this.processFilterParams(params));

    this.getSights$
      .pipe(takeUntil(this.destroy$), debounceTime(200))
      .subscribe(() => {
        this.getSights();
        // markDirty(this);
      });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // console.log('form valueChanges$', value);
      this.updateFilterParams();
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
    // console.log('updateForm', JSON.stringify(filterParams));
    const options = { emitEvent: false };
    const { sightsFilterParams, search } = filterParams;

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
  }

  private getChangedFormControls(): string[] {
    const controls: string[] = [];

    Object.keys(this.form.value).forEach((key) => {
      const value = this.form.value[key];
      const cachedValue = this.cachedFormValue[key];
      if (
        cachedValue === undefined ||
        ((typeof value === 'string' ||
          typeof value === 'boolean' ||
          typeof value === 'number') &&
          value !== cachedValue) ||
        (typeof value === 'object' &&
          value !== null &&
          (typeof cachedValue !== 'object' ||
            JSON.stringify(value) !== JSON.stringify(cachedValue)))
      ) {
        this.cachedFormValue[key] =
          typeof value === 'object' && value !== null ? { ...value } : value;
        controls.push(key);
      }
    });
    // console.log('cachedFormValue:', this.cachedFormValue);

    return controls;
  }

  private processFilterParams(filterParams: FilterParams): void {
    // console.log('processFilterParams', filterParams);
    this.updateForm(filterParams); // change form -> upd route -> upd form (?)

    const changed = this.getChangedFormControls();
    if (changed.length) this.emitGetSights();
  }

  animationDone(filterBlock: FilterBlock): void {
    // the toState, fromState and totalTime data is accessible from the event variable
    filterBlock.showed = filterBlock.opened;
    markDirty(this);
  }

  onOpenedChange(opened: boolean, filterBlock: FilterBlock): void {
    // console.log('onOpenedChange');
    filterBlock.opened = opened;
    this.updateFilterParams(); // TODO setLS only?
  }

  emitGetSights(): void {
    // console.log('>> emitGetSights');
    this.getSights$.next();
  }

  private getSights(): void {
    // console.log('getSights', this.form.valid);
    if (this.form.invalid) return;

    const params: GetSightsParams = {
      limit: this.limit,
      filterParams: this.buildFilterParams(),
    };

    this.setSightsFetching(true);

    this.sightsService
      .getSights(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ({ items, errors }) => {
          this.loggerService.devLog('sightsService data:', items, errors);
          this.sights = [...items]; // .map((item) => ({ ...item, active: false }));
          this.updateSightsActive();

          this.sightsFetched = true;
          this.showServerError = false;
          if (errors?.length) {
            if (
              !items.length &&
              errors.includes('FETCH_SIGHTS_ERROR') &&
              !this.form.value.egrkn.go
            ) {
              this.sightsFetched = false;
              this.showServerError = true; // TODO auto-reload?
            }
            if (errors.includes('FETCH_EGRKN_ERROR')) {
              this.form.patchValue({ egrkn: { go: false } });
              this.showEgrknError = true;
            }
          }

          this.setSightsFetching(false);
        },
        // (error) => {
        //   console.error('! getSights error !', error);
        //   // if (!error.ok) this.showServerError = true;
        //   this.setSightsFetching(false);
        // },
      );
  }

  private setSightsFetching(isFetching: boolean): void {
    this.sightsFetching = isFetching;
    if (this.intervalID) {
      this.windowService.windowRef.clearInterval(this.intervalID);
    }

    if (this.sightsFetched && this.sightsFetching) {
      this.sightsIndicator = DOT;

      this.intervalID = this.windowService.windowRef.setInterval(() => {
        this.sightsIndicator += DOT;
        if (this.sightsIndicator.length > 10) this.sightsIndicator = DOT;
        // this.loggerService.devLog('intervalID', this.intervalID);
        markDirty(this);
      }, 300);
    } else {
      this.sightsIndicator = this.sights.length.toString();
    }
    markDirty(this);
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

  private updateSightsActive(): void {
    this.sights.forEach((sight) => {
      sight.active = this.activeSights.includes(sight.id);
    });
    markDirty(this);
  }

  trackById(_index: number, item: SightData): string {
    return item.id;
  }

  onCardHover(sight: SightDataLocal, hover = true): void {
    if (hover) this.activeSightsService.add(sight.id);
    else this.activeSightsService.delete(sight.id);
  }

  onSearchInputFocus(): void {
    this.searchInputFocused.emit();
  }
}
