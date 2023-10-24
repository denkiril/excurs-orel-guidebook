import { ErrorHandler, NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { WindowService } from './services/window.service';
import { MockWindowService } from './ssr/services/mock-window.service';
import { DocumentService } from './services/document.service';
import { MockDocumentService } from './ssr/services/mock-document.service';
import { LoggerService } from './services/logger.service';
import { ServerLoggerService } from './ssr/services/server-logger.service';
import { MapService } from './services/map.service';
import { MockMapService } from './ssr/services/mock-map.service';

@NgModule({
  imports: [AppModule, ServerModule],
  providers: [
    {
      provide: ErrorHandler,
      useClass: ServerLoggerService,
    },
    {
      provide: WindowService,
      useClass: MockWindowService,
    },
    {
      provide: DocumentService,
      useClass: MockDocumentService,
    },
    {
      provide: LoggerService,
      useClass: ServerLoggerService,
    },
    {
      provide: MapService,
      useClass: MockMapService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
