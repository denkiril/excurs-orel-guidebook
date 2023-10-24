/* eslint-disable no-console */
import { join } from 'path';
import { appendFile, mkdirSync, constants, accessSync } from 'fs';

import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

const { LOGS_PATH } = environment;

@Injectable({
  providedIn: 'root',
})
export class ServerLoggerService {
  constructor() {}

  log(label: string, ...rest: (string | number)[]): void {
    console.log('[serverLog]', label, ...rest);
    this.logToFile(label, ...rest);
  }

  warn(label: string, ...rest: any[]): void {
    console.warn('[serverLog WARN]', label, ...rest);
    this.logToFile('[WARN]', label, ...rest);
  }

  error(label: string, error: Error | any): void {
    console.error('[serverLog ERROR]', label, error);
    this.logToFile('[ERROR]', label, this.stringifyError(error));
  }

  browserLog(label: string, ...rest: any[]): void {
    // empty
  }

  browserWarn(value: any, ...rest: any[]): void {
    // empty
  }

  handleError(error: any): void {
    this.error('[handleError]', error);
  }

  private logToFile(...rest: (string | number)[]): void {
    if (!LOGS_PATH) return;

    const datetime = this.datetime();
    const logsPath = join(LOGS_PATH, ...datetime.substring(0, 10).split('-'));
    const logsFilePath = join(logsPath, 'log.txt');
    const line = `${datetime} ${rest.join(' ').substring(0, 300)}\n`;

    try {
      accessSync(logsPath, constants.W_OK);
    } catch {
      mkdirSync(logsPath, { recursive: true });
    }

    appendFile(logsFilePath, line, (err: any) => {
      if (err) console.log(err);
      console.log(`Wrote variables to ${logsFilePath}`);
    });
  }

  private datetime(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  private stringifyError(err: Error | any): string {
    if (err?.message) {
      return `${err.message} ${err.stack}`;
    }

    return JSON.stringify(err);
  }
}
