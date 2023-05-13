import { TestBed } from '@angular/core/testing';

import { EgrknService } from './egrkn.service';

describe('EgrknService', () => {
  let service: EgrknService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EgrknService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
