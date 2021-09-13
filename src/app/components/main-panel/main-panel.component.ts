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
  // AnimationEvent,
} from '@angular/animations';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';

import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import {
  // GetSightsParams,
  OknCategory,
  OknType,
  SightData,
  SightsFilterParams,
  SightsService,
} from 'src/app/services/sights.service';
import { SettingsService } from 'src/app/services/settings.service';

// TODO:
// 1. выбрано / всего
// 2. Должно быть выбрано хотя бы одно значение в секции Категория охраны... - OK
// 3. Справка (большой тултип?)
// 4. Сохранение настроек фильтра в localStorage - OK
// 5. Вывод карточек объектов по фильтру - OK
// 6. Поиск (и фильтрация?) по имени (вхождению строки?)
// 7. Вывод объектов на карте
// 8. Fix openClose transition
// 9. Настройки фильтра в location

// type BlockName = 'fb1' | 'fb2' | 'fb3';

interface FilterControl {
  name: OknCategory | OknType;
  title: string;
  shortTitle?: string;
  value: boolean;
}

interface FilterGroup {
  name: string; // keyof SightsFilterParams['fb1'];
  title: string;
  shortTitle?: string;
  controls: FilterControl[];
}

interface FilterBlock {
  name: string;
  title: string;
  switchedOn: boolean;
  opened: boolean;
  showed: boolean;
  groups: FilterGroup[];
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
  // @ViewChild('fb1') fb1!: FilterBlockComponent;
  @Input() canExpandPanel = false;
  @Output() expandPanelEvent = new EventEmitter<void>();

  private subs: Subscription[] = [];
  private set sub(s: Subscription) {
    this.subs.push(s);
  }

  public filterBlocks: FilterBlock[] = [];

  public form!: FormGroup;
  public sights: SightData[] = [];

  constructor(
    private sightsService: SightsService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.initFilterBlocks();

    this.form = new FormGroup({
      [this.filterBlocks[0].name]: new FormControl(
        this.filterBlocks[0].switchedOn,
      ),
      [this.filterBlocks[0].groups[0].name]: new FormGroup(
        {},
        this.checkedValidator,
      ),
      [this.filterBlocks[0].groups[1].name]: new FormGroup(
        {},
        this.checkedValidator,
      ),
    });

    this.filterBlocks.forEach((block) => {
      block.groups.forEach((group) => {
        group.controls.forEach((control) => {
          (this.form.get(group.name) as FormGroup).addControl(
            control.name,
            new FormControl(control.value),
          );
        });
      });
    });

    console.log('init form:', this.form);

    this.sub = this.form.statusChanges.subscribe(() => {
      console.log('form statusChanges:', this.form.value);
      this.getSights();
      markDirty(this);
    });

    this.getSights(undefined, true);
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  // public animationStart(opened: boolean): void {
  //   console.log('animationStart:', opened);
  //   if (opened) this.fb1showed = true;
  //   markDirty(this);
  // }

  private initFilterBlocks(): void {
    const filterParams = this.settingsService.getFilterParams();
    const fb1 = filterParams?.fb1;

    const filterBlock1: FilterBlock = {
      name: 'fb1',
      title: 'ОКН',
      switchedOn: fb1?.switchedOn ?? true,
      opened: fb1?.opened ?? false,
      showed: false,
      groups: [
        {
          name: 'category',
          title: 'Категория охраны',
          shortTitle: 'Категория',
          controls: [
            {
              name: 'fed',
              title: 'Федеральный',
              shortTitle: 'Фед.',
              value: fb1?.category?.fed ?? true,
            },
            {
              name: 'reg',
              title: 'Региональный',
              shortTitle: 'Рег.',
              value: fb1?.category?.reg ?? false,
            },
            {
              name: 'mst',
              title: 'Местный',
              shortTitle: 'Мест.',
              value: fb1?.category?.mst ?? false,
            },
            {
              name: 'vvl',
              title: 'Выявленный',
              shortTitle: 'Выяв.',
              value: fb1?.category?.vvl ?? false,
            },
          ],
        },
        {
          name: 'type',
          title: 'Тип',
          controls: [
            {
              name: 'arc',
              title: 'Памятник археологии',
              shortTitle: 'Арх.',
              value: fb1?.type?.arc ?? true,
            },
            {
              name: 'aig',
              title: 'Памятник архитектуры и градостроительства',
              shortTitle: 'Архит.',
              value: fb1?.type?.aig ?? true,
            },
            {
              name: 'his',
              title: 'Памятник истории',
              shortTitle: 'Истор.',
              value: fb1?.type?.his ?? true,
            },
            {
              name: 'art',
              title: 'Памятник искусства',
              shortTitle: 'Искус.',
              value: fb1?.type?.art ?? true,
            },
          ],
        },
      ],
    };

    this.filterBlocks.push(filterBlock1);
    markDirty(this);

    // if (filterParams) {
    //   this.filterBlocks.forEach((block) => {
    //     block.groups.forEach((group) => {
    //       group.controls.forEach((control) => {
    //         if (control.name in filterParams[group.name]) {
    //           control.value = Boolean(filterParams[group.name][control.name]);
    //         }
    //       });
    //     });
    //   });
    // }
  }

  private checkedValidator: ValidatorFn = (ac: AbstractControl) => {
    const controls = (ac as FormGroup).controls || [];

    return Object.keys(controls).some((key) => controls[key].value)
      ? null
      : { notChecked: true };
  };

  public animationDone(filterBlock: FilterBlock): void {
    // the toState, fromState and totalTime data is accessible from the event variable
    // console.log('event:', event);
    // console.log('animationDone:', filterBlock.opened);
    // const fb = this.filterBlocks.find((block) => block.name === blockName);
    // if (fb) fb.showed = opened;
    filterBlock.showed = filterBlock.opened;
    markDirty(this);
  }

  public onOpenedChange(opened: boolean, filterBlock: FilterBlock): void {
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

  private getSights(limit?: number, init = false): void {
    if (this.form.invalid) return;

    const filterParams = this.updateFilterParams(!init);

    this.sightsService
      .getSights({ limit, filterParams })
      .pipe(first())
      .subscribe((data) => {
        this.sights = [...data.items];
      });
  }

  private updateFilterParams(update = true): SightsFilterParams {
    const filterParams: SightsFilterParams = {
      fb1: {
        switchedOn: this.form.value.fb1,
        opened:
          this.filterBlocks.find((block) => block.name === 'fb1')?.opened ??
          false,
        category: this.form.value.category,
        type: this.form.value.type,
      },
    };

    console.log('updateFilterParams:', filterParams);
    if (update) this.settingsService.setFilterParams(filterParams);

    return filterParams;
  }
}
