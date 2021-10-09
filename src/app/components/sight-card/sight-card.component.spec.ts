import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SightCardComponent } from './sight-card.component';

describe('SightCardComponent', () => {
  let component: SightCardComponent;
  let fixture: ComponentFixture<SightCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SightCardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SightCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
