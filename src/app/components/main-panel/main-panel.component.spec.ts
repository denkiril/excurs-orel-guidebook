import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { FilterBlockComponent } from '../controls/filter-block/filter-block.component';
import { LoaderComponent } from '../controls/loader/loader.component';
import { SearchBarComponent } from '../controls/search-bar/search-bar.component';
import { SpinnerComponent } from '../controls/spinner/spinner.component';
import { ToggleComponent } from '../controls/toggle/toggle.component';
import { CheckboxComponent } from '../controls/checkbox/checkbox.component';
import { MainPanelComponent } from './main-panel.component';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('MainPanelComponent', () => {
  let component: MainPanelComponent;
  let fixture: ComponentFixture<MainPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MainPanelComponent,
        FilterBlockComponent,
        LoaderComponent,
        SearchBarComponent,
        ToggleComponent,
        SpinnerComponent,
        CheckboxComponent,
      ],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes([]),
        FormsModule,
        ReactiveFormsModule,
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
