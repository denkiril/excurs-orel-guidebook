import { ErrorHandler, Injectable } from '@angular/core';

import { environment } from 'src/environments/environment';
import { WindowService } from './window.service';

const { production, IS_DEV } = environment;

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  constructor(
    private readonly errorHandler: ErrorHandler,
    private readonly windowService: WindowService,
  ) {}

  setEnvVars(logsPath: string): void {
    // empty
  }

  log(label: string, ...rest: (string | number)[]): void {
    if (!production || IS_DEV) {
      // eslint-disable-next-line no-console
      console.log(label, ...rest);
    }
  }

  warn(value: any, ...rest: any[]): void {
    this.windowService.windowRef.console.warn(value, ...rest);
  }

  error(label: string, error: Error): void {
    this.windowService.windowRef.console.warn(label, error);
    this.errorHandler.handleError(error);
  }

  browserLog(value: any, ...rest: any[]): void {
    if (!environment.production || IS_DEV) {
      this.windowService.windowRef.console.log(value, ...rest);
    }
  }

  browserWarn(value: any, ...rest: any[]): void {
    if (!environment.production || IS_DEV) {
      this.windowService.windowRef.console.warn(value, ...rest);
    }
  }
}
