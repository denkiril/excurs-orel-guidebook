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

// TODO:
// 1. выбрано / всего
// 2. Должно быть выбрано хотя бы одно значение в секции Категория охраны... - OK
// 3. Справка (большой тултип?)
// 4. Сохранение настроек фильтра в localStorage
// 5. Вывод карточек объектов по фильтру
// 6. Поиск (и фильтрация?) по имени (вхождению строки?)
// 7. Вывод объектов на карте

// type BlockName = 'fb1' | 'fb2' | 'fb3';

interface FilterControl {
  name: string;
  title: string;
  shortTitle?: string;
  value: boolean;
}

interface FilterGroup {
  name: string;
  title: string;
  shortTitle?: string;
  controls: FilterControl[];
}

interface FilterBlock {
  name: string;
  title: string;
  switchedOn: boolean;
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
        'open',
        style({
          height: '80px',
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
      transition('open <=> closed', [animate('500ms ease-in-out')]),
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

  public filterBlocks: FilterBlock[] = [
    {
      name: 'fb1',
      title: 'ОКН',
      switchedOn: true,
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
              value: true,
            },
            {
              name: 'reg',
              title: 'Региональный',
              shortTitle: 'Рег.',
              value: false,
            },
            {
              name: 'mst',
              title: 'Местный',
              shortTitle: 'Мест.',
              value: false,
            },
            {
              name: 'vvl',
              title: 'Выявленный',
              shortTitle: 'Выяв.',
              value: false,
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
              value: true,
            },
            {
              name: 'aig',
              title: 'Памятник архитектуры и градостроительства',
              shortTitle: 'Архит.',
              value: true,
            },
            {
              name: 'his',
              title: 'Памятник истории',
              shortTitle: 'Истор.',
              value: true,
            },
            {
              name: 'art',
              title: 'Памятник искусства',
              shortTitle: 'Искус.',
              value: true,
            },
          ],
        },
      ],
    },
  ];

  public form!: FormGroup;
  public cards: number[] = [];

  constructor() {}

  ngOnInit(): void {
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
      markDirty(this);
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub: Subscription) => sub.unsubscribe());
  }

  // public animationStart(opened: boolean): void {
  //   console.log('animationStart:', opened);
  //   if (opened) this.fb1showed = true;
  //   markDirty(this);
  // }

  private checkedValidator: ValidatorFn = (ac: AbstractControl) => {
    const controls = (ac as FormGroup).controls || [];

    return Object.keys(controls).some((key) => controls[key].value)
      ? null
      : { notChecked: true };
  };

  public animationDone(opened: boolean, blockName: string): void {
    // the toState, fromState and totalTime data is accessible from the event variable
    // console.log('event:', event);
    console.log('animationDone:', opened);
    const block = this.filterBlocks.find((block) => block.name === blockName);
    if (block) block.showed = opened;
    markDirty(this);
  }

  public toggleExpandPanel(): void {
    this.expandPanelEvent.emit();
  }

  public search(value: string): void {
    const num = parseInt(value, 10);
    console.log('search:', value, num);
    this.cards = [];
    if (!Number.isNaN(num)) {
      for (let i = 0; i < num; i++) {
        this.cards.push(i);
      }
    }
  }
}
