import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { fromEvent, Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, share } from 'rxjs/operators';
import { WindowService } from './window.service';

export enum MediaSize {
  Mobile = 'Mobile',
  Middle = 'Middle',
  Large = 'Large',
}

const MEDIA_BREAKPOINTS = {
  MOBILE: 768, // 599,
  MIDDLE: 1024,
};

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  public getMediaSize$ = new BehaviorSubject<MediaSize | undefined>(
    this.getMediaSize(true),
  );

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private windowService: WindowService,
  ) {
    this.init();
  }

  get documentRef(): Document {
    return this.document;
  }

  public onFocus$: Observable<Event> = fromEvent(
    this.windowService.windowRef,
    'focus',
  ).pipe(
    // filter(() => {}),
    share(),
  );

  public onResize$: Observable<Event> = fromEvent(
    this.windowService.windowRef,
    'resize',
  ).pipe(debounceTime(300), share());

  public onScroll$: Observable<Event> = fromEvent(
    this.windowService.windowRef,
    'scroll',
    { capture: true },
  ).pipe(debounceTime(20), share());

  public onClick$: Observable<Event> = fromEvent(this.documentRef, 'click');

  public onTouchmove$: Observable<TouchEvent> = fromEvent<TouchEvent>(
    this.documentRef,
    'touchmove',
  );

  private init(): void {
    this.onResize$.subscribe(() => {
      this.getMediaSize$.next(this.getMediaSize());
    });
  }

  private getMediaSize(init = false): MediaSize | undefined {
    // Замечен баг, что ширина окна и документа может отличаться (видимо из-за скроллбара)
    // Также замечено, что при старте приложения "правильная" ширина всегда у окна,
    // а при ресайзе - у документа
    const width1 = this.windowService.windowRef.innerWidth;
    const width2 = this.documentRef.body.clientWidth;
    const width = init ? width1 : width2;
    // console.log('getMediaSize width:', width, width1, width2);

    if (!width) return undefined;

    if (width <= MEDIA_BREAKPOINTS.MOBILE) return MediaSize.Mobile;
    if (width > MEDIA_BREAKPOINTS.MIDDLE) return MediaSize.Large;
    return MediaSize.Middle;
  }
}
