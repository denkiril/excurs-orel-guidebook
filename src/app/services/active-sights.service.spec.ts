import { TestBed } from '@angular/core/testing';

import { ActiveSightsService } from './active-sights.service';

describe('ActiveSightsService', () => {
  let service: ActiveSightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActiveSightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
