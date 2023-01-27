import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TooltipService {
  showTooltip$ = new ReplaySubject<boolean>();

  showTooltip(show: boolean): void {
    this.showTooltip$.next(show);
  }
}
