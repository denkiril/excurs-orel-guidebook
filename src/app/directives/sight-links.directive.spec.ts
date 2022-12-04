import { Observable, of } from 'rxjs';
import { SightLink } from '../models/sights.models';
import { SightLinksDirective } from './sight-links.directive';

class MockHTMLElement {
  get querySelectorAll(): any {
    return [];
  }
}

class MockElementRef {
  nativeElement: MockHTMLElement;

  constructor() {
    this.nativeElement = new MockHTMLElement();
  }
}

const mockRouter = {
  navigate: (): void => {
    // empty
  },
};

const mockSightsService = {
  getSightLinks: (_links: string[]): Observable<SightLink[]> => of([]),
};

describe('SightLinksDirective', () => {
  it('should create an instance', () => {
    const mockEl = new MockElementRef();
    const directive = new SightLinksDirective(
      mockEl as any,
      mockRouter as any,
      mockSightsService as any,
    );
    expect(directive).toBeTruthy();
  });
});
