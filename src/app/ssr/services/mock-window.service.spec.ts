import { TestBed } from '@angular/core/testing';

import { MockWindowService } from './mock-window.service';

describe('MockWindowService', () => {
  let service: MockWindowService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockWindowService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
