import { Component, OnInit, ɵmarkDirty as markDirty } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

interface MenuItem {
  title: string;
  link: string;
  // icon: string;
}

type MenuBlock = {
  items: MenuItem[];
};

enum MENU_BLOCK_NAME {
  TOP = 'top',
  SECTIONS = 'sections',
}

@Component({
  selector: 'exogb-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],
  animations: [
    trigger('openClose', [
      state(
        'open',
        style({
          transform: 'translateY(50px)',
        }),
      ),
      state(
        'closed',
        style({
          transform: 'translateY(calc(100px - 100%))',
        }),
      ),
      transition('open <=> closed', [animate('500ms ease-in-out')]),
    ]),
  ],
})
export class MainMenuComponent implements OnInit {
  opened = false;

  MENU_BLOCK_NAME = MENU_BLOCK_NAME;
  MENU_BLOCKS: { [key in MENU_BLOCK_NAME]: MenuBlock } = {
    [MENU_BLOCK_NAME.TOP]: {
      items: [
        {
          title: 'На сайт «Экскурсии по Орлу»',
          link: 'https://excurs-orel.ru',
        },
      ],
    },
    [MENU_BLOCK_NAME.SECTIONS]: {
      items: [
        {
          title: 'Маршруты',
          link: 'https://excurs-orel.ru/guidebook_/routes/',
        },
        {
          title: 'Музеи',
          link: 'https://excurs-orel.ru/guidebook_/museums/',
        },
        {
          title: 'Документы',
          link: 'https://excurs-orel.ru/guidebook_/documents/',
        },
      ],
    },
  };

  constructor() {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {}

  onClick(): void {
    this.opened = !this.opened;
    markDirty(this);

    console.log('opened:', this.opened);
  }
}
