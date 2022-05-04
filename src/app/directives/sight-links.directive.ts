import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { SightsService } from '../services/sights.service';

@Directive({
  selector: '[exogbSightLinks]',
})
export class SightLinksDirective implements AfterViewInit {
  // @Input() exogbSightLinks?: number;

  constructor(
    private el: ElementRef<HTMLElement>,
    private router: Router,
    private sightsService: SightsService,
  ) {}

  ngAfterViewInit(): void {
    this.init();
  }

  private init(): void {
    const linkEls =
      this.el.nativeElement.querySelectorAll<HTMLElement>('[data-link]');
    const links: string[] = [];
    linkEls.forEach((el) => {
      const linkAttr = el.getAttribute('data-link') as string;
      links.push(linkAttr);
    });

    if (links.length) {
      this.sightsService.getSightLinks(links).subscribe((sightLinks) => {
        if (sightLinks.length) {
          linkEls.forEach((el) => {
            const linkAttr = el.getAttribute('data-link') as string;
            const sightLink = sightLinks.find((item) => item.link === linkAttr);
            if (sightLink) {
              el.setAttribute('data-sightid', sightLink.sightId.toString());
              if (sightLink.title) el.setAttribute('title', sightLink.title);
              el.classList.add('data-link');
            }
          });
        }
      });
    }
  }

  @HostListener('click', ['$event'])
  onClick($event: PointerEvent): void {
    const target = $event.target as HTMLElement | null;

    if (target?.dataset?.sightid) {
      $event.preventDefault();

      this.router.navigate([], {
        queryParams: { sight: target.dataset.sightid },
        queryParamsHandling: 'merge',
      });
    }
  }
}
