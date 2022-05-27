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
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DocumentService } from 'src/app/services/document.service';
import { MapService } from 'src/app/services/map.service';
import { SightsService } from 'src/app/services/sights.service';

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
  private destroy$ = new Subject();
  private isSightForMore = false;

  opened = false;
  transparent = false;
  minimize = false;

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
    private elRef: ElementRef<HTMLElement>,
    private documentService: DocumentService,
    private sightsService: SightsService,
    private mapService: MapService,
  ) {}

  ngOnInit(): void {
    this.documentService.onClick$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => this.onDocumentClick(event));

    this.documentService.onScroll$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.opened = false;
        this.transparent = this.isSightForMore;
        markDirty(this);
      });

    this.sightsService.sightForMore$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.isSightForMore = !!data;
        if (!this.isSightForMore) this.transparent = false;
      });

    this.mapService.initialized$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.setMinimize(true));
  }

  ngAfterViewInit(): void {
    const h1El = this.documentService.documentRef.getElementById(
      'header-title-container',
    );
    if (h1El) h1El.remove();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMenuButtonClick(): void {
    this.toggleOpened();
  }

  private toggleOpened(): void {
    this.opened = !this.opened;
    markDirty(this);
  }

  private onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (this.opened && !this.elRef.nativeElement.contains(target)) {
      this.toggleOpened();
    }
  }

  onLogoButtonClick(): void {
    this.setMinimize(!this.minimize);
  }

  private setMinimize(minimize: boolean): void {
    this.minimize = minimize;
    this.opened = false;
    markDirty(this);
  }
}
