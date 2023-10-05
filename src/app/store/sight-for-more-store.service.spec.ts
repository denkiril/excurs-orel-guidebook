import { TestBed } from '@angular/core/testing';

import { SightForMoreStoreService } from './sight-for-more-store.service';

describe('SightForMoreStoreService', () => {
  let service: SightForMoreStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SightForMoreStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
