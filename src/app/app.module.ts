import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IconsModule } from './icons/icons.module';
import { AppComponent } from './app.component';
import { MainMapComponent } from './components/main-map/main-map.component';
import { MainPanelComponent } from './components/main-panel/main-panel.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { SearchBarComponent } from './components/controls/search-bar/search-bar.component';

@NgModule({
  declarations: [
    AppComponent, //
    MainMapComponent,
    MainPanelComponent,
    MainMenuComponent,
    SearchBarComponent,
  ],
  imports: [
    BrowserModule, //
    BrowserAnimationsModule,
    // FormsModule,
    IconsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
