import { Injectable } from '@angular/core';
import { WindowExtended } from 'src/app/services/window.service';

@Injectable({
  providedIn: 'root',
})
export class MockWindowService {
  get windowRef(): WindowExtended {
    return {
      console: {
        log: () => null,
        warn: () => null,
        error: () => null,
      },
    } as unknown as WindowExtended;
  }
}
