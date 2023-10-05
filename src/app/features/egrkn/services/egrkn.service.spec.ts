import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { EgrknService } from './egrkn.service';

describe('EgrknService', () => {
  let service: EgrknService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EgrknService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
