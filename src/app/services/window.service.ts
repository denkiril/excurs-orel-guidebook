import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  get windowRef(): Window & typeof globalThis {
    return window;
  }
}
