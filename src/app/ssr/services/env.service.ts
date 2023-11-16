import { Injectable } from '@angular/core';
import { LoggerService } from 'src/app/services/logger.service';
import { RequestService } from 'src/app/services/request.service';

@Injectable({
  providedIn: 'root',
})
export class EnvService {
  private env = {
    EXOGB_MKRF_OPENDATA_APIKEY: '',
    EXOGB_LOGS_PATH: '',
  };

  constructor(
    private readonly loggerService: LoggerService,
    private readonly requestService: RequestService,
  ) {}

  init(): void {
    // console.log('EnvService init. process.env:', process.env);
    (Object.keys(this.env) as (keyof typeof this.env)[]).forEach((key) => {
      this.env[key] = process.env[key] ?? this.env[key];
    });
    // console.log('EnvService init. this.env:', this.env);

    this.loggerService.setEnvVars(this.env.EXOGB_LOGS_PATH);
    this.requestService.setEnvVars(this.env.EXOGB_MKRF_OPENDATA_APIKEY);
  }

  // get(key: keyof typeof this.env): string {
  //   return this.env[key];
  // }
}
