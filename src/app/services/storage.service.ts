import { Injectable } from '@angular/core';
import { WindowService } from './window.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly localStorageInner?: Storage;

  constructor(private readonly windowService: WindowService) {
    this.localStorageInner = this.getLocalStorage();
  }

  private getLocalStorage(): Storage | undefined {
    const kv = 'test';

    try {
      // Обращение к localStorage может выдавать DOMException из-за полного запрета cookie в браузере:
      // "Failed to read the 'localStorage' property from 'Window': Access is denied for this document"
      const { localStorage } = this.windowService.windowRef;
      if (!localStorage) return undefined;

      localStorage.setItem(kv, kv);
      localStorage.removeItem(kv);

      return localStorage;
    } catch (e) {
      return undefined;
    }
  }

  isLocalStorageAvailable(): boolean {
    return Boolean(this.localStorageInner);
  }

  getItem(key: string): string | null {
    return this.localStorageInner?.getItem(key) || null;
  }

  setItem(key: string, value: string): void {
    this.localStorageInner?.setItem(key, value);
  }

  removeItem(key: string): void {
    this.localStorageInner?.removeItem(key);
  }
}
