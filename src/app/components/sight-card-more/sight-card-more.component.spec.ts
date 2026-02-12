import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { SightCardMoreComponent } from './sight-card-more.component';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

describe('SightCardMoreComponent', () => {
  let component: SightCardMoreComponent;
  let fixture: ComponentFixture<SightCardMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SightCardMoreComponent],
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        provideMockStore({}),
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SightCardMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
