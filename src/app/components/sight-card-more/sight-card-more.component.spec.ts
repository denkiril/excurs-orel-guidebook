import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconsModule } from 'src/app/icons/icons.module';

import { SightCardMoreComponent } from './sight-card-more.component';

describe('SightCardMoreComponent', () => {
  let component: SightCardMoreComponent;
  let fixture: ComponentFixture<SightCardMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, IconsModule],
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
