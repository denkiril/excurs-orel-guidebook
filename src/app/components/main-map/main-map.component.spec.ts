import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';

import { MapService } from 'src/app/services/map.service';
import { MainMapComponent } from './main-map.component';
import { SpinnerComponent } from '../controls/spinner/spinner.component';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

class MockMapService {
  init$(): Observable<void> {
    return of();
  }

  update(): void {
    // empty
  }

  destroy(): void {
    // empty
  }
}

describe('MainMapComponent', () => {
  let component: MainMapComponent;
  let fixture: ComponentFixture<MainMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainMapComponent, SpinnerComponent],
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        { provide: MapService, useClass: MockMapService },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MainMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
