import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ɵmarkDirty as markDirty,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  District,
  OKN_CATEGORIES,
  OKN_TYPES,
  SightData,
  SightDataExt,
  SightsService,
} from 'src/app/services/sights.service';

@Component({
  selector: 'exogb-sight-card-more',
  templateUrl: './sight-card-more.component.html',
  styleUrls: ['./sight-card-more.component.scss'],
})
export class SightCardMoreComponent implements OnInit, OnDestroy {
  @Input() sightId!: number;
  @Input() sights: SightData[] = [];

  @Output() closeCard = new EventEmitter<void>();

  destroy$ = new Subject();
  sight?: SightDataExt;
  typeText = '';
  categoryText = '';
  isMuseum = false;
  showServerError = false;
  fetching = false;

  constructor(private sightsService: SightsService) {}

  ngOnInit(): void {
    const sight = this.sights.find((item) => item.post_id === this.sightId);
    console.log('SightCardMore init', sight, this.sights, this.sightId);
    if (sight) this.initSight(sight);

    this.getSight();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initSight(sight: SightData): void {
    this.sight = sight;
    this.isMuseum = !!this.sight.sets && this.sight.sets[0] === 'mus';

    if (this.isMuseum) {
      this.typeText = 'Государственный музей';
    } else {
      this.typeText = this.sight.type ? OKN_TYPES[this.sight.type[0]].full : '';
      this.categoryText = this.sight.category
        ? OKN_CATEGORIES[this.sight.category[0]].full
        : '';
    }

    if (this.sight.district) {
      this.sight.districtStr = this.defineDistrictStr(this.sight.district);
    }

    markDirty(this);
  }

  private defineDistrictStr(district: District): string {
    let districtStr = '';

    switch (district) {
      case '1':
        districtStr = 'Заводской';
        break;
      case '2':
        districtStr = 'Железнодорожный';
        break;
      case '3':
        districtStr = 'Советский';
        break;
      default:
        break;
    }

    return districtStr;
  }

  public getSight(): void {
    this.fetching = true;
    markDirty(this);

    this.sightsService
      .getSightById(this.sightId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (data) => {
          console.log('getSightById data:', data);
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

  public onClose(): void {
    this.closeCard.emit();
  }
}
