import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
// import { MatIconModule } from '@angular/material/icon'; // TODO Error: Error retrieving icon...

import { SecondPanelComponent } from './second-panel.component';
import { SightCardMoreComponent } from '../sight-card-more/sight-card-more.component';

describe('SecondPanelComponent', () => {
  let component: SecondPanelComponent;
  let fixture: ComponentFixture<SecondPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      declarations: [SecondPanelComponent, SightCardMoreComponent],
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
