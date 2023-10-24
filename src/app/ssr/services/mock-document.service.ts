import { Injectable } from '@angular/core';
import { Observable, EMPTY, BehaviorSubject } from 'rxjs';
import { MediaSize } from 'src/app/services/document.service';

@Injectable({
  providedIn: 'root',
})
export class MockDocumentService {
  getMediaSize$ = new BehaviorSubject<MediaSize | undefined>(undefined);

  get documentRef(): Document {
    return {
      getElementById: () => null,
    } as unknown as Document;
  }

  onFocus$: Observable<Event> = EMPTY;

  onResize$: Observable<Event> = EMPTY;

  onScroll$: Observable<Event> = EMPTY;

  onClick$: Observable<Event> = EMPTY;

  onTouchmove$: Observable<TouchEvent> = EMPTY;
}
