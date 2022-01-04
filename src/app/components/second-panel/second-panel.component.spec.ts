import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecondPanelComponent } from './second-panel.component';

describe('SecondPanelComponent', () => {
  let component: SecondPanelComponent;
  let fixture: ComponentFixture<SecondPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SecondPanelComponent],
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
