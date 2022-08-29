import { TestBed } from '@angular/core/testing';

import { ParamsGuard } from './params.guard';

describe('ParamsGuard', () => {
  let guard: ParamsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ParamsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
