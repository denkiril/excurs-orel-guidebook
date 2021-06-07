import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { IconsModule } from './icons/icons.module';
import { AppComponent } from './app.component';
import { MainMapComponent } from './components/main-map/main-map.component';
import { MainPanelComponent } from './components/main-panel/main-panel.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';

@NgModule({
  declarations: [
    AppComponent, //
    MainMapComponent,
    MainPanelComponent,
    MainMenuComponent,
  ],
  imports: [
    BrowserModule, //
    IconsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
