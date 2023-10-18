import { Injectable } from '@angular/core';
import { EMPTY, Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MockMapService {
  initialized$ = new ReplaySubject<void>();

  init$(): Observable<void> {
    return EMPTY;
  }

  destroy(): void {}
}
