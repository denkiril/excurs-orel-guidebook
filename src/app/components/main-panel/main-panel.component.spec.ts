import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MainPanelComponent } from './main-panel.component';

describe('MainPanelComponent', () => {
  let component: MainPanelComponent;
  let fixture: ComponentFixture<MainPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MainPanelComponent],
      imports: [BrowserAnimationsModule],
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
