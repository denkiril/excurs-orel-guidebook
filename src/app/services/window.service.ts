import { Injectable } from '@angular/core';

type WindowExtended = Window &
  typeof globalThis & {
    navigator: Navigator & {
      systemLanguage?: string;
      userLanguage?: string;
    };
    gtag?: (command: string, action: string, params?: any) => void;
    ym?: (id: number, method: string, target: string, params?: any) => void;
    ymaps?: any;
  };

@Injectable({
  providedIn: 'root',
})
export class WindowService {
  get windowRef(): WindowExtended {
    return window as WindowExtended;
  }
}
