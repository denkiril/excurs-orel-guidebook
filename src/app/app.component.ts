import {
  Component,
  ElementRef,
  // HostListener,
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

import { environment } from 'src/environments/environment';
import { UtilitiesService } from './services/utilities.service';
import { WindowService } from './services/window.service';
import { DocumentService, MediaSize } from './services/document.service';
import { SightForMoreData } from './services/sights.service';
import { SettingsService } from './services/settings.service';

const TOP_MARGIN = 80;
const BOTTOM_MARGIN = 128;

// TODO:
// Add map layout on movePanel upper center

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

  destroy$ = new Subject();
  public isMobile = false;
  public translateY = 0;
  private translateYStart = 0;
  private paddingSummand = 0;
  private translateYBreakpoint = -400;
  public expandButtonPressed = false;
  public sightForMore?: SightForMoreData;
  public showSightForMore = false;

  // eslint-disable-next-line max-params
  constructor(
    private renderer: Renderer2,
    private windowService: WindowService,
    private documentService: DocumentService,
    private utilitiesService: UtilitiesService,
    private settingsService: SettingsService,
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
    // console.info('Version -> ', process.env.REACT_APP_VERSION || version);
    console.info(`Version -> ${environment.VERSION}`);

    this.calcVars();

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

    this.documentService.onClick$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        console.log('AppComponent document click');
        this.utilitiesService.documentClickedTarget.next(
          event.target as HTMLElement,
        );
      });

    this.documentService.onTouchmove$
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        if (this.expandButtonPressed) this.movePanel(event);
      });

    this.settingsService.sightForMore$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) this.sightForMore = data;
        this.showSightForMore = !!data;
        markDirty(this);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private calcVars(): void {
    this.translateYBreakpoint = -Math.floor(
      this.windowService.windowRef.innerHeight / 2,
    );

    this.paddingSummand =
      this.mainPanelContainer.nativeElement.clientHeight - BOTTOM_MARGIN + 8;

    console.log('[][] translateYBreakpoint', this.translateYBreakpoint);
    console.log('[][] paddingSummand', this.paddingSummand);
    this.correctMainPanel(true);
  }

  private checkExpandPanelAbility(mediaSize: MediaSize | undefined): void {
    this.isMobile = mediaSize === MediaSize.Mobile;

    if (!this.isMobile) this.setTranslateY(0);
    markDirty(this);
  }

  public onExpandBtnClick(): void {
    console.log('onExpandBtnClick', this.translateY, this.translateYBreakpoint);

    const translateY =
      this.translateY < this.translateYBreakpoint - 30 ||
      this.translateY > this.translateYBreakpoint + 30
        ? this.translateYBreakpoint
        : 0;

    this.setTranslateY(translateY);
    this.setTransition(true);
  }

  public onExpandBtnTouchstart(event: TouchEvent): void {
    this.expandButtonPressed = true;
    this.translateYStart = event.changedTouches[0].pageY - this.translateY;
    this.setTransition(false);

    console.log(
      'onExpandBtnTouchstart',
      event.changedTouches[0].pageY,
      this.translateY,
      this.translateYStart,
    );
  }

  public onExpandBtnTouchend(): void {
    console.log('onExpandBtnTouchend');
    this.expandButtonPressed = false;
  }

  private movePanel(event: TouchEvent): void {
    const { pageY } = event.changedTouches[0];
    const translateY = pageY - this.translateYStart;
    // console.log('pageY, translateY:', pageY, translateY);
    if (pageY > TOP_MARGIN && translateY <= 0) this.setTranslateY(translateY);
  }

  private setTranslateY(translateY: number): void {
    this.translateY = translateY;

    this.renderer.setStyle(
      this.mainPanelContainer.nativeElement,
      'transform',
      `translateY(${translateY}px)`,
    );

    if (this.isMobile) this.correctMainPanel();
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

  public onClosePanel(): void {
    this.showSightForMore = false;
    markDirty(this);
  }

  public animationDone(event: AnimationEvent): void {
    // the toState, fromState and totalTime data is accessible from the event variable
    console.log('animationDone', this.showSightForMore, this.sightForMore);
    console.log('animationDone', event);
    // if (this.sightForMore && !this.showSightForMore) {
    if (this.sightForMore && event.toState === 'closed') {
      this.sightForMore = undefined;
      this.settingsService.setSightForMore();
      // markDirty(this);
    }
  }
}
