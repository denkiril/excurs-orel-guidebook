import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ParamsGuard } from './params.guard';

describe('ParamsGuard', () => {
  let guard: ParamsGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
    });
    guard = TestBed.inject(ParamsGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
