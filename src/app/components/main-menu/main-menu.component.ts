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
  private readonly destroy$ = new Subject();
  // private isSightForMore = false;

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
        {
          title: 'Старый Путеводитель',
          link: 'https://excurs-orel.ru/guidebook_old/',
        },
      ],
    },
  };

  constructor(
    private readonly elRef: ElementRef<HTMLElement>,
    private readonly documentService: DocumentService,
    private readonly sightsService: SightsService,
    private readonly mapService: MapService,
  ) {}

  ngOnInit(): void {
    this.documentService.onClick$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => this.onDocumentClick(event));

    // this.documentService.onScroll$
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(() => {
    //     this.opened = false;
    //     this.transparent = this.isSightForMore;
    //     markDirty(this);
    //   });

    this.sightsService.sightForMore$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        // const isSightForMore = !!data;
        this.transparent = !!data;
        this.minimize = true;
        this.opened = false;
        markDirty(this);
      });

    this.mapService.initialized$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.setMinimize(true));
  }

  ngAfterViewInit(): void {
    const h1El = this.documentService.documentRef.getElementById(
      'gb-header-container',
    );
    if (h1El) h1El.innerHTML = '';
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
