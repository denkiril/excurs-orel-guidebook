import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SightData, SightType } from 'src/app/models/sights.models';
import { GeolocationPipe } from 'src/app/pipes/geolocation.pipe';
import { SightCardComponent } from './sight-card.component';

const mockSight: SightData = {
  id: 'id',
  type: SightType.DEFAULT,
  title: '',
  thumb_url: '',
  permalink: '',
};

describe('SightCardComponent', () => {
  let component: SightCardComponent;
  let fixture: ComponentFixture<SightCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      declarations: [SightCardComponent, GeolocationPipe],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SightCardComponent);
    component = fixture.componentInstance;

    component.sight = mockSight;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
