import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ɵmarkDirty as markDirty,
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Subscription } from 'rxjs';

import { DocumentService } from 'src/app/services/document.service';
import { UtilitiesService } from 'src/app/services/utilities.service';

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
          transform: 'translateY(calc(50px - 100%))',
        }),
      ),
      transition('open <=> closed', [animate('500ms ease-in-out')]),
    ]),
  ],
})
export class MainMenuComponent implements OnInit, AfterViewInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private set sub(s: Subscription) {
    this.subscriptions.push(s);
  }

  public opened = false;

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

  constructor(
    private elRef: ElementRef,
    private documentService: DocumentService,
    private utilitiesService: UtilitiesService,
  ) {}

  ngOnInit(): void {
    this.sub = this.utilitiesService.documentClickedTarget.subscribe((target) =>
      this.onDocumentClick(target),
    );
  }

  ngAfterViewInit(): void {
    const h1El = this.documentService.documentRef.getElementById(
      'header-title-container',
    );
    if (h1El) h1El.remove();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  private toggleOpened(): void {
    this.opened = !this.opened;
    markDirty(this);
  }

  public onMenuButtonClick(): void {
    this.toggleOpened();
  }

  private onDocumentClick(target: any): void {
    if (this.opened && !this.elRef.nativeElement.contains(target)) {
      this.toggleOpened();
    }
  }
}
