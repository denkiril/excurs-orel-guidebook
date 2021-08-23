import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IconsModule } from './icons/icons.module';
import { AppComponent } from './app.component';
import { MainMapComponent } from './components/main-map/main-map.component';
import { MainPanelComponent } from './components/main-panel/main-panel.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { SearchBarComponent } from './components/controls/search-bar/search-bar.component';
import { CheckboxComponent } from './components/controls/checkbox/checkbox.component';
import { RadiobuttonComponent } from './components/controls/radiobutton/radiobutton.component';
import { ToggleComponent } from './components/controls/toggle/toggle.component';
import { FilterBlockComponent } from './components/controls/filter-block/filter-block.component';

@NgModule({
  declarations: [
    AppComponent,
    MainMapComponent,
    MainPanelComponent,
    MainMenuComponent,
    SearchBarComponent,
    CheckboxComponent,
    RadiobuttonComponent,
    ToggleComponent,
    FilterBlockComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IconsModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
