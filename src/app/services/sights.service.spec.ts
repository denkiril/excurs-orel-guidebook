import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SightsService } from './sights.service';

describe('SightsService', () => {
  let service: SightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(SightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
