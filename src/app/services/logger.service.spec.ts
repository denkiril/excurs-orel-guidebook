import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LoggerService } from './logger.service';
import { WindowService } from './window.service';

class MockErrorHandler implements ErrorHandler {
  handleError = jasmine.createSpy('handleError');
}

describe('LoggerService', () => {
  let service: LoggerService;
  let windowService: WindowService;
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useClass: MockErrorHandler }],
    });

    service = TestBed.inject(LoggerService);
    windowService = TestBed.inject(WindowService);
    errorHandler = TestBed.inject(ErrorHandler);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
