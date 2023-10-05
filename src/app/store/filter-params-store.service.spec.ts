import { TestBed } from '@angular/core/testing';

import { FilterParamsStoreService } from './filter-params-store.service';

describe('FilterParamsStoreService', () => {
  let service: FilterParamsStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterParamsStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
