import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { environment } from 'src/environments/environment';
import { AppComponent } from './app.component';
import { MainMapComponent } from './components/main-map/main-map.component';
import { MainPanelComponent } from './components/main-panel/main-panel.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { SearchBarComponent } from './components/controls/search-bar/search-bar.component';
import { CheckboxComponent } from './components/controls/checkbox/checkbox.component';
import { RadiobuttonComponent } from './components/controls/radiobutton/radiobutton.component';
import { ToggleComponent } from './components/controls/toggle/toggle.component';
import { FilterBlockComponent } from './components/controls/filter-block/filter-block.component';
import { SpinnerComponent } from './components/controls/spinner/spinner.component';
import { SightCardComponent } from './components/sight-card/sight-card.component';
import { SightCardMoreComponent } from './components/sight-card-more/sight-card-more.component';
import { LoaderComponent } from './components/controls/loader/loader.component';
import { SecondPanelComponent } from './components/second-panel/second-panel.component';
import { PictureComponent } from './components/ui/picture/picture.component';
import { SightImagesComponent } from './components/sight-images/sight-images.component';
import { SightLinksDirective } from './directives/sight-links.directive';
import { ParamsGuard } from './core/params.guard';
import { StringTickerPipe } from './pipes/string-ticker.pipe';
import { GeolocationPipe } from './pipes/geolocation.pipe';
import { reducers } from './store/reducers';

export const routes: Routes = [
  {
    path: '',
    component: AppComponent,
    canActivate: [ParamsGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];

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
    SpinnerComponent,
    SightCardComponent,
    SightCardMoreComponent,
    LoaderComponent,
    SecondPanelComponent,
    PictureComponent,
    SightImagesComponent,
    SightLinksDirective,
    StringTickerPipe,
    GeolocationPipe,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
    }),
    StoreModule.forRoot(reducers),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
  ],
  providers: [{ provide: APP_BASE_HREF, useValue: '/guidebook/' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
