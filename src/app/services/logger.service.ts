import { ErrorHandler, Injectable } from '@angular/core';

import { ConfigService } from './config.service';
import { WindowService } from './window.service';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly isProduction = this.configService.config.production;
  private readonly isDev = this.configService.config.IS_DEV;

  constructor(
    private readonly errorHandler: ErrorHandler,
    private readonly configService: ConfigService,
    private readonly windowService: WindowService,
  ) {}

  setEnvVars(logsPath: string): void {
    // empty
  }

  log(label: string, ...rest: (string | number)[]): void {
    if (!this.isProduction || this.isDev) {
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
    if (!this.isProduction || this.isDev) {
      this.windowService.windowRef.console.log(value, ...rest);
    }
  }

  browserWarn(value: any, ...rest: any[]): void {
    if (!this.isProduction || this.isDev) {
      this.windowService.windowRef.console.warn(value, ...rest);
    }
  }
}
