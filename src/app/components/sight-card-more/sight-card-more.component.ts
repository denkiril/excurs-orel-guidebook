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
  SightDataExt,
  SightId,
  SightType,
} from 'src/app/models/sights.models';
import { OKN_TYPES, OKN_CATEGORIES } from 'src/app/models/sights.constants';
import { DEFAULT_OKN_TITLE } from 'src/app/features/egrkn/egrkn.constants';
import { SightsService } from 'src/app/services/sights.service';
import { FilterParamsStoreService } from 'src/app/store/filter-params-store.service';
import { LoggerService } from 'src/app/services/logger.service';
import { SeoService } from 'src/app/services/seo.service';
import { StoreService } from 'src/app/store/store.service';
import { TransferStateService } from 'src/app/services/transfer-state.service';

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
    private readonly loggerService: LoggerService,
    private readonly seoService: SeoService,
    private readonly storeService: StoreService,
    private readonly transferStateService: TransferStateService,
  ) {}

  ngOnInit(): void {
    const transfered = this.transferStateService.getSightForMore();
    // console.log('transfered', transfered?.id);
    if (transfered) {
      this.sightId = transfered.id;
      this.initSight(transfered);
    }

    this.filterParamsStore.sightForMore$
      .pipe(takeUntil(this.destroy$))
      .subscribe((sightForMore) => {
        if (this.sightId !== sightForMore) {
          this.sightId = sightForMore;
          this.getSight();
        }
      });
  }

  ngOnDestroy(): void {
    this.updateSeoParams(null);
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initSight(sight: SightDataExt): void {
    // console.log('initSight', sight.id);
    this.sight = sight;
    this.storeService.setSightForMore(sight);

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
    this.updateSeoParams(sight);
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

  private updateSeoParams(sight: SightDataExt | null): void {
    if (sight === null) {
      this.seoService.updateSeoParams(undefined, undefined, undefined, 'high');
      return;
    }

    const seoTitle =
      sight.title !== DEFAULT_OKN_TITLE
        ? sight.title
        : `${sight.title} ${sight.location || sight.okn_date}`;

    const seoDescription =
      sight.type === SightType.EGRKN
        ? `Информация об объекте ${seoTitle} из реестра ОКН Министерства культуры РФ.`
        : `Информация об объекте ${seoTitle} из Путеводителя по Орлу.`;

    const canonicalParamsStr = `sight=${sight.id}`;

    this.seoService.updateSeoParams(
      seoTitle,
      seoDescription,
      canonicalParamsStr,
      'high',
    );
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
            this.transferStateService.setSightForMore(data);
            this.initSight(data);
          } else {
            this.close();
          }
          this.fetching = false;
          this.showServerError = false;
          this.cdr.detectChanges();
        },
        (error) => {
          this.loggerService.error('getSightDataExt', error);
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
