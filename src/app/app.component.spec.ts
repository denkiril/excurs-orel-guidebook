import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { MainMapComponent } from './components/main-map/main-map.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { MainPanelComponent } from './components/main-panel/main-panel.component';
import { SearchBarComponent } from './components/controls/search-bar/search-bar.component';
import { LoaderComponent } from './components/controls/loader/loader.component';
import { AppComponent } from './app.component';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MainMenuComponent,
        MainPanelComponent,
        MainMapComponent,
        SearchBarComponent,
        LoaderComponent,
      ],
      imports: [RouterTestingModule.withRoutes([]), NoopAnimationsModule],
      providers: [
        provideMockStore({}),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
