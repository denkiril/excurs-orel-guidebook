import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ActiveSightsService } from './active-sights.service';

describe('ActiveSightsService', () => {
  let service: ActiveSightsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule.withRoutes([])],
    });
    service = TestBed.inject(ActiveSightsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
