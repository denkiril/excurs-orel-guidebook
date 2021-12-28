import { fakeAsync, TestBed, tick } from '@angular/core/testing';

import { DocumentService } from './document.service';

const DEBOUNCE_TIME = 500;

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit getMediaSize$ on window resize', fakeAsync(() => {
    const spy = spyOn(service.getMediaSize$, 'next');

    window.dispatchEvent(new Event('resize'));
    tick(DEBOUNCE_TIME);

    expect(spy).toHaveBeenCalled();
  }));
});
