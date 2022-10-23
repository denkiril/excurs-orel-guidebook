import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { WindowService } from './window.service';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  constructor(
    private readonly errorHandler: ErrorHandler,
    private readonly windowService: WindowService,
  ) {}

  log(value: any, ...rest: any[]): void {
    this.windowService.windowRef.console.log(value, ...rest);
  }

  error(error: Error): void {
    this.errorHandler.handleError(error);
  }

  warn(value: any, ...rest: any[]): void {
    this.windowService.windowRef.console.warn(value, ...rest);
  }

  devLog(value: any, ...rest: any[]): void {
    if (!environment.production) {
      this.windowService.windowRef.console.log(value, ...rest);
    }
  }
}
