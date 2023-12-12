import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { MainMapComponent } from './components/main-map/main-map.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { MainPanelComponent } from './components/main-panel/main-panel.component';
import { SearchBarComponent } from './components/controls/search-bar/search-bar.component';
import { LoaderComponent } from './components/controls/loader/loader.component';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        NoopAnimationsModule,
        HttpClientTestingModule,
      ],
      providers: [provideMockStore({})],
      declarations: [
        AppComponent,
        MainMenuComponent,
        MainPanelComponent,
        MainMapComponent,
        SearchBarComponent,
        LoaderComponent,
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
