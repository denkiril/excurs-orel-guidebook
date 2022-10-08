import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';
import { WindowService } from './window.service';

interface MockLocalStorage {
  getItem?: () => string | null;
  setItem?: () => void;
  removeItem?: () => void;
}

const mockLSItem = 'mock LS item';

const mockLocalStorage: MockLocalStorage = {
  getItem: () => mockLSItem,
  setItem: () => null,
  removeItem: () => null,
};

class MockWindowService {
  windowRef = {
    localStorage: mockLocalStorage,
  };

  constructor(ls: any) {
    this.windowRef = {
      localStorage: ls,
    };
  }
}

describe('StorageService', () => {
  let service: StorageService;
  let windowServiceStub: MockWindowService;
  let windowService: WindowService;

  const configureTestingModule = (ls: any): void => {
    windowServiceStub = new MockWindowService(ls);

    TestBed.configureTestingModule({
      providers: [{ provide: WindowService, useValue: windowServiceStub }],
    });

    service = TestBed.inject(StorageService);
    windowService = TestBed.inject(WindowService);
  };

  it('should be created', () => {
    configureTestingModule(mockLocalStorage);

    expect(service).toBeTruthy();
  });

  it('isLocalStorageAvailable() should return true if window.localStorage available', () => {
    configureTestingModule(mockLocalStorage);

    expect(service.isLocalStorageAvailable()).toBeTrue();
  });

  it('isLocalStorageAvailable() should return false if no localStorage in window', () => {
    configureTestingModule(undefined);

    expect(service.isLocalStorageAvailable()).toBeFalse();
  });

  it('isLocalStorageAvailable() should return false if window.localStorage is not available', () => {
    configureTestingModule(
      new DOMException(
        'Failed to read the "localStorage" property from "Window": Access is denied for this document.',
      ),
    );

    expect(service.isLocalStorageAvailable()).toBeFalse();
  });

  it('getItem() should return localStorage.getItem response if window.localStorage is available', () => {
    configureTestingModule(mockLocalStorage);

    expect(service.getItem('some_key')).toBe(mockLSItem);
  });

  it('getItem() should return null if window.localStorage is not available', () => {
    configureTestingModule(undefined);

    expect(service.getItem('some_key')).toBeNull();
  });

  it('setItem() should call localStorage.setItem with same arguments if window.localStorage is available', () => {
    configureTestingModule(mockLocalStorage);

    const mockKey = 'mock_key';
    const mockValue = 'mock value';
    const spy = spyOn(windowService.windowRef.localStorage, 'setItem');

    service.setItem(mockKey, mockValue);
    expect(spy).toHaveBeenCalledWith(mockKey, mockValue);
  });

  it('setItem() should work if window.localStorage is not available', () => {
    configureTestingModule(new DOMException('< DOMException text >'));

    service.setItem('mockKey', 'mockValue');
    expect(service.isLocalStorageAvailable()).toBeFalse();
  });

  it('removeItem() should call localStorage.removeItem with same arguments if window.localStorage is available', () => {
    configureTestingModule(mockLocalStorage);

    const mockKey = 'mock_key';
    const spy = spyOn(windowService.windowRef.localStorage, 'removeItem');

    service.removeItem(mockKey);
    expect(spy).toHaveBeenCalledWith(mockKey);
  });

  it('removeItem() should work if window.localStorage is not available', () => {
    configureTestingModule(null);

    service.removeItem('mockKey');
    expect(service.isLocalStorageAvailable()).toBeFalse();
  });
});
