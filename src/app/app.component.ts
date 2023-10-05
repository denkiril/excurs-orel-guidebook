import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
  ɵmarkDirty as markDirty,
} from '@angular/core';
import {
  animate,
  AnimationEvent,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { WindowService } from './services/window.service';
import { DocumentService, MediaSize } from './services/document.service';
import { AnalyticsService } from './services/analytics.service';
import { SightsService } from './services/sights.service';
import { FilterParamsStoreService } from './store/filter-params-store.service';

const TOP_MARGIN = 50; // height: calc(100vh - {TOP_MARGIN}px); [app.component.scss]
const BOTTOM_MARGIN = 148; // top: calc(100vh - {BOTTOM_MARGIN}px);

@Component({
  selector: 'exogb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('secondPanelAnim', [
      state(
        'closed',
        style({
          transform: 'translateX(-100%)',
        }),
      ),
      state(
        'opened',
        style({
          transform: 'translateX(0)',
        }),
      ),
      transition('closed <=> opened', [animate('400ms ease-out')]),
    ]),
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('mainPanelContainer', { static: true, read: ElementRef })
  mainPanelContainer!: ElementRef;

  @ViewChild('mainPanel', { static: true, read: ElementRef })
  mainPanel!: ElementRef;

  private readonly destroy$ = new Subject();
  isMobile = false;
  translateY = 0;
  private translateYStart = 0;
  private paddingSummand = 0;
  private translateYBreakpoint = -400;
  private translateYTop = -680;
  expandButtonPressed = false;
  sightForMoreShowing = false;
  sightForMoreExist = false;
  fixMainPanel = false;

  // eslint-disable-next-line max-params
  constructor(
    private readonly renderer: Renderer2,
    private readonly windowService: WindowService,
    private readonly documentService: DocumentService,
    private readonly sightsService: SightsService,
    private readonly analyticsService: AnalyticsService,
    private readonly filterParamsStore: FilterParamsStoreService,
  ) {}

  // @HostListener('window:resize')
  // onResize(): void {
  //   this.checkExpandPanelAbility();
  // }

  // @HostListener('document:click', ['$event'])
  // documentClick(event: any): void {
  //   console.log('AppComponent document click');
  //   this.utilitiesService.documentClickedTarget.next(event.target);
  // }

  // @HostListener('document:touchmove', ['$event'])
  // onTouchmove(event: TouchEvent): void {
  //   if (this.expandButtonPressed) {
  //     event.preventDefault(); // prevent Chrome "pull down to refresh" feature
  //     this.movePanel(event);
  //   }
  // }

  ngOnInit(): void {
    this.analyticsService.sendEvent('app start');
    this.calcVars();
    this.initObservables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calcVars(): void {
    this.translateYBreakpoint = -Math.floor(
      this.windowService.windowRef.innerHeight / 2,
    );
    this.translateYTop = -Math.floor(
      this.windowService.windowRef.innerHeight - BOTTOM_MARGIN - TOP_MARGIN,
    );
    this.paddingSummand =
      this.mainPanelContainer.nativeElement.clientHeight - BOTTOM_MARGIN + 8;

    // console.log('[][] translateYBreakpoint', this.translateYBreakpoint);
    // console.log('[][] translateYTop', this.translateYTop);
    // console.log('[][] paddingSummand', this.paddingSummand);
    this.correctMainPanel(true);
  }

  private initObservables(): void {
    this.documentService.onResize$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calcVars();
      });

    this.documentService.getMediaSize$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mediaSize) => {
        this.checkExpandPanelAbility(mediaSize);
      });

    this.documentService.onTouchmove$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (this.expandButtonPressed) this.movePanel(event);
      });

    this.filterParamsStore.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ sightForMore }) => {
        this.sightForMoreShowing = !!sightForMore;
        if (sightForMore) {
          this.sightForMoreExist = true;
        }
        markDirty(this);
      });
  }

  private checkExpandPanelAbility(mediaSize: MediaSize | undefined): void {
    this.isMobile = mediaSize === MediaSize.Mobile;

    if (!this.isMobile) this.setTranslateY(0);
    markDirty(this);
  }

  onExpandBtnClick(): void {
    // console.log('onExpandBtnClick', this.translateY, this.translateYBreakpoint);

    if (this.fixMainPanel) {
      this.setMainPanelFixed(false, this.translateYBreakpoint);
    } else {
      const translateY =
        this.translateY < this.translateYBreakpoint - 30 ||
        this.translateY > this.translateYBreakpoint + 30
          ? this.translateYBreakpoint
          : 0;

      this.setTranslateY(translateY);
      this.setTransition(true);
    }
  }

  onExpandBtnTouchstart(event: TouchEvent): void {
    if (this.fixMainPanel) {
      this.setMainPanelFixed(false, this.translateYBreakpoint);
    } else {
      this.expandButtonPressed = true;
      this.translateYStart = event.changedTouches[0].pageY - this.translateY;
      this.setTransition(false);
    }

    // console.log(
    //   'onExpandBtnTouchstart',
    //   event.changedTouches[0].pageY,
    //   this.translateY,
    //   this.translateYStart,
    // );
  }

  onExpandBtnTouchend(): void {
    // console.log('onExpandBtnTouchend');
    this.expandButtonPressed = false;
  }

  private movePanel(event: TouchEvent): void {
    const { pageY } = event.changedTouches[0];
    const translateY = pageY - this.translateYStart;
    // if (pageY > TOP_MARGIN && translateY <= 0) {
    if (translateY > this.translateYTop && translateY <= 0) {
      // console.log('pageY, translateY:', pageY, translateY);
      this.setTranslateY(translateY);
    }
  }

  private setTranslateY(translateY: number): void {
    this.translateY = translateY;

    this.renderer.setStyle(
      this.mainPanelContainer.nativeElement,
      'transform',
      `translateY(${translateY}px)`,
    );

    if (this.isMobile) this.correctMainPanel(this.fixMainPanel);
  }

  private correctMainPanel(reset = false): void {
    let paddingBottom = reset ? 0 : this.translateY + this.paddingSummand;
    if (paddingBottom < 0) paddingBottom = 0;

    this.renderer.setStyle(
      this.mainPanel.nativeElement,
      'padding-bottom',
      `${paddingBottom}px`,
    );
  }

  private setTransition(hasTransition: boolean): void {
    if (hasTransition) {
      this.renderer.setStyle(
        this.mainPanelContainer.nativeElement,
        'transition',
        'transform 0.4s ease-out',
      );
    } else {
      this.renderer.removeStyle(
        this.mainPanelContainer.nativeElement,
        'transition',
      );
    }
  }

  onClosePanel(): void {
    this.sightForMoreShowing = false;
    markDirty(this);
  }

  animationDone(event: AnimationEvent): void {
    // the toState, fromState and totalTime data is accessible from the event variable
    // console.log('animationDone', event);
    if (this.sightForMoreExist && event.toState === 'closed') {
      this.sightForMoreExist = false;
      this.sightsService.redirectToSightForMore(undefined);
    }
  }

  onSearchInputFocus(): void {
    // search & mobile keyboard bugfix
    if (this.isMobile) {
      this.setMainPanelFixed(true, 0);
    }
  }

  private setMainPanelFixed(fixed: boolean, translateY: number): void {
    this.fixMainPanel = fixed;
    this.setTranslateY(translateY);
    this.setTransition(false);
    markDirty(this);
  }
}
