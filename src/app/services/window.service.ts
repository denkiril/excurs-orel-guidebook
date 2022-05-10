import { Injectable } from '@angular/core';

type WindowExtended = Window &
  typeof globalThis & {
    navigator: Navigator & {
      systemLanguage?: string;
      userLanguage?: string;
    };
    gtag?: (action: string, name: string, params?: any) => void;
    ym?: (id: number, action: string, name: string) => void;
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
