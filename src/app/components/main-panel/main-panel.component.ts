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
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';

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

// TODO:
// 1. выбрано / всего
// 2. Должно быть выбрано хотя бы одно значение в секции Категория охраны... +
// 3. Справка (большой тултип?)
// 4. Сохранение настроек фильтра в localStorage +
// 5. Вывод карточек объектов по фильтру +
// 6. Поиск (и фильтрация?) по имени (вхождению строки?)
// 7. Вывод объектов на карте
// 8. Fix openClose transition
// 9. Настройки фильтра в queryParams +
// 10. Loader

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

  public filterBlocks: FilterBlock[] = [...FILTER_BLOCKS];

  public form!: FormGroup;
  public sights: SightData[] = [];

  constructor(
    private sightsService: SightsService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    const filterParams = this.settingsService.getFilterParams();
    if (filterParams) this.updateFilterBlocks(filterParams);

    // init form
    this.form = new FormGroup({
      // [this.filterBlocks[0].name]: new FormControl(
      //   this.filterBlocks[0].switchedOn,
      // ),
      // [this.filterBlocks[0].groups[0].name]: new FormGroup(
      //   {},
      //   this.checkedValidator,
      // ),
      // [this.filterBlocks[0].groups[1].name]: new FormGroup(
      //   {},
      //   this.checkedValidator,
      // ),
    });

    this.filterBlocks.forEach((block) => {
      this.form.addControl(block.name, new FormControl(block.switchedOn));

      block.groups.forEach((group) => {
        this.form.addControl(
          group.name,
          new FormGroup({}, this.selectValidators(group.name)),
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

    this.sub = this.settingsService.filterParamsInRoute.subscribe((params) => {
      console.log('filterParamsInRoute$', params);
      this.updateForm(params);
      this.getSights$.next();
    });

    this.sub = this.form.valueChanges.subscribe(() => {
      console.log('form valueChanges$', this.form.value);
      this.updateFilterParams();
      // this.getSights$.next();
    });

    this.sub = this.getSights$.pipe(debounceTime(300)).subscribe(() => {
      this.getSights();
      markDirty(this);
    });

    this.getSights$.next();
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

  private selectValidators(name: string): ValidatorFn {
    return name === 'category' || name === 'type'
      ? this.checkedValidator
      : Validators.nullValidator;
  }

  private checkedValidator: ValidatorFn = (ac: AbstractControl) => {
    const controls = (ac as FormGroup).controls || [];

    return Object.keys(controls).some((key) => controls[key].value)
      ? null
      : { notChecked: true };
  };

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

  public search(value: string): void {
    const num = parseInt(value, 10);
    if (!Number.isNaN(num)) {
      this.getSights(num);
    }
  }

  private getSights(limit?: number): void {
    if (this.form.invalid) return;

    const params: GetSightsParams = {
      limit,
      filterParams: this.buildFilterParams(),
    };

    this.sightsService
      .getSights(params)
      .pipe(first())
      .subscribe((data) => {
        this.sights = [...data.items];
      });
  }

  private buildFilterParams(): SightsFilterParams {
    const filterParams: SightsFilterParams = {};

    this.filterBlocks.forEach((block) => {
      filterParams[block.name] = {
        switchedOn: this.form.value[block.name],
        opened: block?.opened ?? false,
        groups: Object.fromEntries(
          block.groups.map((group) => [
            group.name,
            this.form.value[group.name],
          ]),
        ),
      };
    });

    return filterParams;
  }

  private updateFilterParams(): void {
    console.log('updateFilterParams');
    this.settingsService.setFilterParams(this.buildFilterParams());
  }
}
