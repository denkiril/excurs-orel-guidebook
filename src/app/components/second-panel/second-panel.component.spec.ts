import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { SecondPanelComponent } from './second-panel.component';
import { SightCardMoreComponent } from '../sight-card-more/sight-card-more.component';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('SecondPanelComponent', () => {
  let component: SecondPanelComponent;
  let fixture: ComponentFixture<SecondPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecondPanelComponent, SightCardMoreComponent],
      imports: [RouterTestingModule],
      providers: [
        provideMockStore({}),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
