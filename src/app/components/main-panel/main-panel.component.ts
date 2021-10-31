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

import { Subject, Subscription } from 'rxjs';
import { debounceTime, first } from 'rxjs/operators';

import {
  FilterBlock,
  FILTER_BLOCKS,
  GetSightsParams,
  SightData,
  SightsFilterParams,
  SightsService,
} from 'src/app/services/sights.service';
import { SettingsService } from 'src/app/services/settings.service';
import { CustomValidators } from 'src/app/core/custom-validators';

// TODO:
// выбрано / всего
// Справка (большой тултип?)
// Поиск (и фильтрация?) по имени (вхождению строки?)
// Настройки фильтра в queryParams - search
// Вывод объектов на карте
// Loader for map
// Fix openClose transition
// Show images setting
// Lazy loading images?
// Карточка объекта, и кнопка назад
// Карточка объекта в роуте
// Офлайн-режим
// Свой набор достопр-тей: избранное, в роуте

@Component({
  selector: 'exogb-main-panel',
  templateUrl: './main-panel.component.html',
  styleUrls: ['./main-panel.component.scss'],
  animations: [
    trigger('openClose', [
      state(
        'opened',
        style({
          height: 'auto',
          opacity: 1,
        }),
      ),
      state(
        'closed',
        style({
          height: '0',
          opacity: 0,
        }),
      ),
      transition('opened <=> closed', [animate('500ms ease-in-out')]),
    ]),
  ],
})
export class MainPanelComponent implements OnInit, OnDestroy {
  @Input() canExpandPanel = false;
  @Output() expandPanelEvent = new EventEmitter<void>();

  getSights$ = new Subject();

  private subs: Subscription[] = [];
  private set sub(s: Subscription) {
    this.subs.push(s);
  }

  public readonly filterBlocks: FilterBlock[] = [...FILTER_BLOCKS];

  public form!: FormGroup;
  public sights: SightData[] = [];
  public sightForMore: SightData | null = null;
  public showServerError = false;
  private limit?: number;

  constructor(
    public sightsService: SightsService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    const filterParams = this.settingsService.getFilterParams();
    if (filterParams) this.updateFilterBlocks(filterParams);

    this.initForm(filterParams);

    this.sub = this.settingsService.filterParamsInRoute.subscribe((params) => {
      console.log('filterParamsInRoute$', params);
      this.updateForm(params);
      this.emitGetSights();
    });

    this.sub = this.getSights$.pipe(debounceTime(300)).subscribe(() => {
      this.getSights();
      markDirty(this);
    });

    this.emitGetSights();
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  private updateFilterBlocks(filterParams: SightsFilterParams): void {
    console.log('updateFilterBlocks');
    this.filterBlocks.forEach((block) => {
      block.opened = filterParams[block.name]?.opened ?? block.opened;
    });
  }

  private initForm(filterParams?: SightsFilterParams): void {
    this.form = new FormGroup({});

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

    if (filterParams) this.updateForm(filterParams);
    console.log('init form:', this.form);

    this.sub = this.form.valueChanges.subscribe(() => {
      console.log('form valueChanges$', this.form.value);
      this.updateFilterParams();
      // -> filterParamsInRoute -> getSights...
    });
  }

  private updateForm(filterParams: SightsFilterParams): void {
    console.log('updateForm');
    const options = { emitEvent: false };

    this.filterBlocks.forEach((block) => {
      const blockParams = filterParams[block.name];
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

  // TODO rem
  public search(value: string): void {
    const num = parseInt(value, 10);
    if (!Number.isNaN(num)) {
      this.limit = num;
      this.emitGetSights();
    }
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

    this.sightsService
      .getSights(params)
      .pipe(first())
      .subscribe(
        (data) => {
          console.log('sightsService data:', data);
          this.sights = [...data.items];
          this.showServerError = false;
          markDirty(this);
        },
        (error) => {
          console.error('!! Error:', error);
          if (!error.ok) this.showServerError = true;
          markDirty(this);
        },
      );
  }

  private buildFilterParams(): SightsFilterParams {
    return this.sightsService.buildFilterParams(
      this.filterBlocks,
      this.form.value,
    );
  }

  private updateFilterParams(): void {
    console.log('updateFilterParams');
    this.settingsService.setFilterParams(this.buildFilterParams());
  }

  public setSightForMore(sight: SightData | null): void {
    this.sightForMore = sight;
    markDirty(this);
  }
}
