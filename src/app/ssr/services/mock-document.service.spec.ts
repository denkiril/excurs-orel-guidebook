import { TestBed } from '@angular/core/testing';

import { MockDocumentService } from './mock-document.service';

describe('MockDocumentService', () => {
  let service: MockDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
