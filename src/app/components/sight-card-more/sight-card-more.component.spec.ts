import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SightCardMoreComponent } from './sight-card-more.component';

describe('SightCardMoreComponent', () => {
  let component: SightCardMoreComponent;
  let fixture: ComponentFixture<SightCardMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SightCardMoreComponent],
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
