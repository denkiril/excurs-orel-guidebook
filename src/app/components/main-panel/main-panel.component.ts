import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Subject, timer } from 'rxjs';
import { debounceTime, first, takeUntil } from 'rxjs/operators';

import {
  SightData,
  FilterBlock,
  FilterParams,
  SightsFilterParams,
  GetSightsParams,
  SightId,
} from 'src/app/models/sights.models';
import { SightsService } from 'src/app/services/sights.service';
import { SettingsService } from 'src/app/services/settings.service';
import { CustomValidators } from 'src/app/core/custom-validators';
import { LoggerService } from 'src/app/services/logger.service';
import { ActiveSightsService } from 'src/app/services/active-sights.service';
import { FilterParamsStoreService } from 'src/app/store/filter-params-store.service';
import { AppService } from 'src/app/services/app.service';
import { TransferStateService } from 'src/app/services/transfer-state.service';

interface SightDataLocal extends SightData {
  active?: boolean;
}

@Component({
  selector: 'exogb-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  private readonly tickerDestroy$ = new Subject();

  readonly filterBlocks: FilterBlock[] = this.settingsService.getFilterBlocks();

  form!: UntypedFormGroup;
  sights: SightDataLocal[] = this.transferStateService.getSightsList();
  showServerError = false;
  private readonly limit?: number;
  sightsFetching = false;
  sightsFetched: boolean = this.sights.length > 0;
  ticker = 0;
  showEgrknError = false;
  private cachedFormValue: any = {};
  private activeSights: SightId[] = [];

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly appService: AppService,
    private readonly loggerService: LoggerService,
    private readonly sightsService: SightsService,
    private readonly activeSightsService: ActiveSightsService,
    private readonly settingsService: SettingsService,
    private readonly filterParamsStore: FilterParamsStoreService,
    private readonly transferStateService: TransferStateService,
  ) {}

  ngOnInit(): void {
    // this.transferState.set(SIGHTS_STATE_KEY, []);
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
    this.tickerDestroy$.next();
    this.tickerDestroy$.complete();
  }

  private initForm(): void {
    this.form = new UntypedFormGroup({
      search: new UntypedFormControl(''),
    });

    this.filterBlocks.forEach((block) => {
      this.form.addControl(
        block.name,
        new UntypedFormControl(block.switchedOn),
      );

      block.groups.forEach((group) => {
        this.form.addControl(
          group.name,
          new UntypedFormGroup(
            {},
            group.name === 'okn_category' || group.name === 'okn_type'
              ? CustomValidators.checkedFormGroup
              : Validators.nullValidator,
          ),
        );

        group.controls.forEach((control) => {
          (this.form.get(group.name) as UntypedFormGroup).addControl(
            control.name,
            new UntypedFormControl(control.value),
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
      if (filterParams.sightsFilterParams && !this.appService.isServer) {
        this.updateFilterBlocks(filterParams.sightsFilterParams);
      }
      // this.updateForm(filterParams);
    }

    this.filterParamsStore.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => params && this.processFilterParams(params));

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
    // TODO Check LS, not route?
    // console.log('updateFilterBlocks', JSON.stringify(sightsFilterParams));
    this.filterBlocks.forEach((block) => {
      // block.opened = sightsFilterParams[block.name]?.opened ?? block.opened;
      block.opened =
        sightsFilterParams[block.name] === undefined
          ? false
          : sightsFilterParams[block.name].opened ?? block.opened;
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
    this.cdr.detectChanges();
  }

  onOpenedChange(opened: boolean, filterBlock: FilterBlock): void {
    filterBlock.opened = opened;
    this.cdr.detectChanges();
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
          this.loggerService.browserLog('sightsService data:', items, errors);
          this.sights = items.map((item) => ({
            ...item,
            active: this.activeSights.includes(item.id),
          }));
          this.transferStateService.setSightsList(items);
          // this.updateSightsActive();

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
    this.cdr.detectChanges();

    if (this.sightsFetched && this.sightsFetching) {
      this.tickerDestroy$.next();
      timer(0, 300)
        .pipe(takeUntil(this.tickerDestroy$))
        .subscribe((value) => {
          this.ticker = value;
          this.cdr.detectChanges();
        });
    }
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
    this.cdr.detectChanges();
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
