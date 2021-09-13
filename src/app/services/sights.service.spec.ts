import { TestBed } from '@angular/core/testing';

import { SightsService } from './sights.service';

describe('SightsService', () => {
  let service: SightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
