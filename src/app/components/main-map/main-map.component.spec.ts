import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of } from 'rxjs';

import { MapService } from 'src/app/services/map.service';
import { MainMapComponent } from './main-map.component';
import { SpinnerComponent } from '../controls/spinner/spinner.component';

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
      providers: [{ provide: MapService, useClass: MockMapService }],
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [MainMapComponent, SpinnerComponent],
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
