import {
  Component,
  EventEmitter,
  OnInit,
  OnDestroy,
  Output,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  District,
  OKN_CATEGORIES,
  OKN_TYPES,
  SightData,
  SightDataExt,
  SightId,
  SightType,
} from 'src/app/models/sights.models';
import { SightsService } from 'src/app/services/sights.service';
import { FilterParamsStoreService } from 'src/app/store/filter-params-store.service';

@Component({
  selector: 'exogb-sight-card-more',
  templateUrl: './sight-card-more.component.html',
  styleUrls: ['./sight-card-more.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SightCardMoreComponent implements OnInit, OnDestroy {
  @Output() closeCard = new EventEmitter<void>();

  private readonly destroy$ = new Subject();
  private sightId?: SightId;

  readonly SightType = SightType;
  sight?: SightDataExt;
  typeText = '';
  districtText = '';
  categoryText = '';
  isMuseum = false;
  showServerError = false;
  fetching = false;
  introHTML?: SafeHtml;
  articleHTML?: SafeHtml;

  constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly sightsService: SightsService,
    private readonly sanitizer: DomSanitizer,
    private readonly filterParamsStore: FilterParamsStoreService,
  ) {}

  ngOnInit(): void {
    this.filterParamsStore.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ sightForMore }) => {
        // console.log('SightCardMoreComponent sightForMore', sightForMore);
        if (this.sightId !== sightForMore) {
          this.sightId = sightForMore;
          this.getSight();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initSight(sight: SightData): void {
    this.sight = sight;
    // console.log('initSight', this.sight);

    this.isMuseum = !!this.sight.sets && this.sight.sets[0] === 'mus';

    if (this.isMuseum) {
      this.typeText = 'Государственный музей';
      this.categoryText = '';
    } else {
      this.typeText = this.sight.okn_type
        ? OKN_TYPES[this.sight.okn_type[0]].full
        : '';
      this.categoryText = this.sight.okn_category
        ? OKN_CATEGORIES[this.sight.okn_category[0]].full
        : '';
    }

    this.districtText = this.sight.district
      ? this.defineDistrictText(this.sight.district)
      : '';

    this.introHTML = this.sight.gba_intro
      ? this.sanitizer.bypassSecurityTrustHtml(
          this.convertIntroHTML(this.sight.gba_intro),
        )
      : undefined;

    this.articleHTML = this.sight.gba_content
      ? this.sanitizer.bypassSecurityTrustHtml(
          this.convertIntroHTML(this.sight.gba_content),
        )
      : undefined;

    this.cdr.detectChanges();
  }

  private defineDistrictText(district: District): string {
    let text = '';

    switch (district) {
      case '1':
        text = 'Заводской';
        break;
      case '2':
        text = 'Железнодорожный';
        break;
      case '3':
        text = 'Советский';
        break;
      default:
        break;
    }

    return text;
  }

  private convertIntroHTML(intro: string): string {
    // const parser = new DOMParser();
    // console.log('xml:', parser.parseFromString(intro, 'application/xml'));
    // console.log('text/html:', parser.parseFromString(intro, 'text/html'));
    let html = intro;
    const re = /<a[^>]*>([^<]+)<\/a>/gi;
    const aTags = html.match(re);
    aTags?.forEach((tag) => {
      // console.log('tag:', tag);
      const aValue = tag.match(/href=["'](.*?)["']/);
      // console.log('aValue:', aValue);
      if (!aValue || (aValue && aValue[1][0] === '/')) {
        const aContent = tag.replace(re, '$1');
        const newTag = aValue
          ? `<span data-link="${aValue[1]}">${aContent}</span>`
          : aContent;
        html = html.replace(tag, newTag);
      }
    });

    return html;
  }

  getSight(): void {
    if (!this.sightId) return;

    this.fetching = true;
    this.cdr.detectChanges();

    // console.log('getSightDataExt...');
    this.sightsService
      .getSightDataExt$(this.sightId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          // console.log('getSightDataExt data:', data);
          if (data) {
            this.initSight(data);
          } else {
            this.close();
          }
          this.fetching = false;
          this.showServerError = false;
          this.cdr.detectChanges();
        },
        (error) => {
          console.error('getSightDataExt error:', error);
          if (error.status === 404) {
            this.close();
          } else {
            this.showServerError = true;
          }
          this.fetching = false;
          this.cdr.detectChanges();
        },
      );
  }

  close(): void {
    this.closeCard.emit();
  }
}
