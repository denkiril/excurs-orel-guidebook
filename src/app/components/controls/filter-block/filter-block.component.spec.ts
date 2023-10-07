import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleComponent } from '../toggle/toggle.component';
import { FilterBlockComponent } from './filter-block.component';

describe('FilterBlockComponent', () => {
  let component: FilterBlockComponent;
  let fixture: ComponentFixture<FilterBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilterBlockComponent, ToggleComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
