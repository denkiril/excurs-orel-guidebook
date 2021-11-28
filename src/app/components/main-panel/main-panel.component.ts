import {
  Component,
  EventEmitter,
  Input,
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

// TODO:
// totalCount
// Справка (большой тултип?)
// Фильтрация по имени (вхождению строки)?
// Настройки фильтра в queryParams - search +
// Вывод объектов на карте
// Loader for map
// Fix openClose transition +-
// Show images setting
// Lazy loading images +-
// Lazy loading sights
// Карточка объекта, и кнопка назад +
// Карточка объекта в роуте +
// Офлайн-режим
// Свой набор достопр-тей: избранное, в роуте
// Sights sorting. Default? Manual?

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
  @Input() canExpandPanel = false;
  @Output() expandPanelEvent = new EventEmitter<void>();

  getSights$ = new Subject();
  destroy$ = new Subject();

  public readonly filterBlocks: FilterBlock[] = [...FILTER_BLOCKS];

  public form!: FormGroup;
  public sights: SightData[] = [];
  public sightIdForMore?: number;
  public showServerError = false;
  private limit?: number;
  public sightsFetching = false;
  public sightsFetched = false;

  constructor(
    public sightsService: SightsService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    this.settingsService.filterParamsInRoute$
      .pipe(first())
      .subscribe((params) => {
        console.log('settingsService.filterParamsInRoute', params);
        this.initWithFilterParams(params);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.form = new FormGroup({
      search: new FormControl(''),
      sightId: new FormControl(),
    });

    this.filterBlocks.forEach((block) => {
      this.form.addControl(block.name, new FormControl(block.switchedOn));

      block.groups.forEach((group) => {
        this.form.addControl(
          group.name,
          new FormGroup(
            {},
            group.name === 'category' || group.name === 'type'
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

    console.log('init form:', this.form);
  }

  private initWithFilterParams(filterParamsInRoute: FilterParams): void {
    console.log('initWithFilterParams:', filterParamsInRoute);
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
      console.log('form valueChanges$', this.form.value);
      this.updateFilterParams();
      // -> filterParamsInRoute -> getSights...
    });

    this.emitGetSights();
  }

  private updateFilterBlocks(sightsFilterParams: SightsFilterParams): void {
    console.log('updateFilterBlocks');
    this.filterBlocks.forEach((block) => {
      block.opened = sightsFilterParams[block.name]?.opened ?? block.opened;
    });
  }

  private updateForm(filterParams: FilterParams): void {
    console.log('updateForm');
    const options = { emitEvent: false };
    const { sightsFilterParams } = filterParams;

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

    this.form.patchValue({ search: filterParams.search || '' }, options);

    this.form.patchValue({ sightId: filterParams.sightId }, options);
    if (this.sightIdForMore !== this.form.value.sightId) {
      this.sightIdForMore = this.form.value.sightId;
      markDirty(this);
    }
  }

  private processFilterParams(filterParams: FilterParams): void {
    console.log('filterParamsInRoute$', filterParams);
    this.updateForm(filterParams);
    this.emitGetSights();
  }

  public animationDone(filterBlock: FilterBlock): void {
    // the toState, fromState and totalTime data is accessible from the event variable
    filterBlock.showed = filterBlock.opened;
    markDirty(this);
  }

  public onOpenedChange(opened: boolean, filterBlock: FilterBlock): void {
    console.log('onOpenedChange');
    filterBlock.opened = opened;
    this.updateFilterParams();
  }

  public toggleExpandPanel(): void {
    this.expandPanelEvent.emit();
  }

  public emitGetSights(): void {
    console.log('emitGetSights', !this.sightIdForMore);
    if (!this.sightIdForMore) this.getSights$.next();
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
          console.log('sightsService data:', data);
          this.sights = [...data.items];
          this.sightsFetching = false;
          this.sightsFetched = true;
          this.showServerError = false;
          markDirty(this);
        },
        (error) => {
          console.error('!! Error:', error);
          this.sightsFetching = false;
          if (!error.ok) this.showServerError = true;
          markDirty(this);
        },
      );
  }

  private buildFilterParams(): FilterParams {
    return this.sightsService.buildFilterParams(
      this.filterBlocks,
      this.form.value,
    );
  }

  private updateFilterParams(): void {
    console.log('updateFilterParams');
    this.settingsService.setFilterParams(this.buildFilterParams());
  }

  public setSightForMore(sight?: SightData): void {
    this.form.patchValue({ sightId: sight?.post_id });
  }

  public trackById(_index: number, item: SightData): number {
    return item.post_id;
  }
}
