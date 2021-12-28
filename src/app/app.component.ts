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
// import {
//   animate,
//   state,
//   style,
//   transition,
//   trigger,
// } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UtilitiesService } from './services/utilities.service';
import { WindowService } from './services/window.service';
// import { MOBILE_SCREEN_WIDTH } from './core/constants';
import { DocumentService, MediaSize } from './services/document.service';

const TOP_MARGIN = 80;

// TODO:
// Add map layout on movePanel upper center

@Component({
  selector: 'exogb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  // animations: [
  //   trigger('expandPanel', [
  //     state(
  //       'default',
  //       style({
  //         transform: 'translateY(0)',
  //       }),
  //     ),
  //     state(
  //       'expanded',
  //       style({
  //         transform: 'translateY(calc(80px - 100%))',
  //       }),
  //     ),
  //     transition('default <=> expanded', [animate('400ms ease-out')]),
  //   ]),
  // ],
})
export class AppComponent implements OnInit, OnDestroy {
  @ViewChild('mainPanelContainer', { static: true, read: ElementRef })
  mainPanelContainer!: ElementRef;

  destroy$ = new Subject();
  public isMobile = false;
  public translateY = 0;
  private translateYStart = 0;
  private translateYBreakpoint = -400;
  public expandButtonPressed = false;

  constructor(
    private documentService: DocumentService,
    private utilitiesService: UtilitiesService,
    private windowService: WindowService,
    private renderer: Renderer2,
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
  //     this.onPanelTouchmove(event);
  //   }
  // }

  ngOnInit(): void {
    this.translateYBreakpoint = -Math.floor(
      this.windowService.windowRef.innerHeight / 2,
    );

    console.log('translateYBreakpoint', this.translateYBreakpoint);

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
}
