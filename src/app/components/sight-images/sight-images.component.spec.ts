import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SightImagesComponent } from './sight-images.component';

describe('SightImagesComponent', () => {
  let component: SightImagesComponent;
  let fixture: ComponentFixture<SightImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SightImagesComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SightImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
