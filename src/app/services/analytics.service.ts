import { Injectable } from '@angular/core';
import { WindowService } from './window.service';

const YM_ID = 52494430;
const CATEGORY_NAME = 'exogb';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  constructor(private readonly windowService: WindowService) {}

  sendEvent(action: string): void {
    const { gtag, ym } = this.windowService.windowRef;
    const label = 'test_label';
    console.log('sendEvent', action);

    if (gtag) {
      // https://developers.google.com/analytics/devguides/collection/gtagjs/events?hl=ru
      gtag('event', action, {
        event_category: CATEGORY_NAME,
        event_label: label,
      });
    }

    if (ym) {
      // https://yandex.ru/support/metrica/objects/reachgoal.html
      ym(YM_ID, 'reachGoal', action, { category: CATEGORY_NAME, label });
    }
  }
}
