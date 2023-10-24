import { TestBed } from '@angular/core/testing';

import { MockMapService } from './mock-map.service';

describe('MockMapService', () => {
  let service: MockMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
