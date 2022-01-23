import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconsModule } from 'src/app/icons/icons.module';
import { SightData } from 'src/app/services/sights.service';

import { SightCardComponent } from './sight-card.component';

const mockSight: SightData = {
  post_id: 0,
  title: '',
  thumb_url: '',
  permalink: '',
};

describe('SightCardComponent', () => {
  let component: SightCardComponent;
  let fixture: ComponentFixture<SightCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconsModule],
      declarations: [SightCardComponent],
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
