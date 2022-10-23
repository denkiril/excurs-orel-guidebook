import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { environment } from 'src/environments/environment';
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

  it('should delegate to console.log only in no-production mode on devLog', () => {
    const spy = spyOn(windowService.windowRef.console, 'log');

    environment.production = true;
    service.devLog('param1', 'param2', 'param3');
    expect(spy).not.toHaveBeenCalled();

    environment.production = false;
    service.devLog('param1', 'param2', 'param3');
    expect(spy).toHaveBeenCalledWith('param1', 'param2', 'param3');
  });

  it('should delegate to console.warn', () => {
    const spy = spyOn(windowService.windowRef.console, 'warn');

    service.warn('param1', 'param2', 'param3');

    expect(spy).toHaveBeenCalledWith('param1', 'param2', 'param3');
  });

  it('should delegate to ErrorHandler', () => {
    const err = new Error('some error message');

    service.error(err);

    expect(errorHandler.handleError).toHaveBeenCalledWith(err);
  });
});
