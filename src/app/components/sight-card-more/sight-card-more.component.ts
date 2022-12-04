import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnChanges,
  Output,
  ɵmarkDirty as markDirty,
  SimpleChanges,
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
  SightForMoreData,
} from 'src/app/models/sights.models';
import { SightsService } from 'src/app/services/sights.service';

@Component({
  selector: 'exogb-sight-card-more',
  templateUrl: './sight-card-more.component.html',
  styleUrls: ['./sight-card-more.component.scss'],
})
export class SightCardMoreComponent implements OnChanges, OnDestroy {
  @Input() sightForMore!: SightForMoreData;
  @Input() sights: SightData[] = [];

  @Output() closeCard = new EventEmitter<void>();

  destroy$ = new Subject();
  sight?: SightDataExt;
  typeText = '';
  districtText = '';
  categoryText = '';
  isMuseum = false;
  showServerError = false;
  fetching = false;
  sightId?: number;
  introHTML?: SafeHtml;
  articleHTML?: SafeHtml;

  constructor(
    private readonly sightsService: SightsService,
    private readonly sanitizer: DomSanitizer,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('SimpleChanges:', JSON.stringify(changes.sightForMore));
    const { currentValue, previousValue } = changes.sightForMore;
    const curId = currentValue.sight?.post_id || currentValue.sightId;
    const prevId = previousValue?.sight?.post_id || previousValue?.sightId;
    // console.log('curId, prevId', curId, prevId);
    if (curId !== prevId) {
      this.sightId = curId;
      const sight =
        this.sightForMore.sight ||
        this.sights.find((item) => item.post_id === this.sightId);

      if (sight) this.initSight(sight);
      this.getSight();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initSight(sight: SightData): void {
    this.sight =
      this.sight?.post_id === sight.post_id
        ? { ...this.sight, ...sight }
        : sight;
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

    markDirty(this);
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
    markDirty(this);

    this.sightsService
      .getSightById(this.sightId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          // console.log('getSightById data:', data);
          this.initSight(data);
          this.fetching = false;
          this.showServerError = false;
          markDirty(this);
        },
        (error) => {
          console.error('getSightById error:', error);
          this.fetching = false;
          this.showServerError = true;
          markDirty(this);
        },
      );
  }

  close(): void {
    this.closeCard.emit();
  }
}
