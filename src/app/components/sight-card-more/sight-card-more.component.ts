import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  OKN_CATEGORIES,
  OKN_TYPES,
  SightData,
} from 'src/app/services/sights.service';

@Component({
  selector: 'exogb-sight-card-more',
  templateUrl: './sight-card-more.component.html',
  styleUrls: ['./sight-card-more.component.scss'],
})
export class SightCardMoreComponent implements OnInit {
  @Input() sight!: SightData;
  @Output() closeCard = new EventEmitter<void>();

  typeText = '';
  categoryText = '';
  isMuseum = false;

  ngOnInit(): void {
    console.log('SightCardMore init', this.sight);
    this.isMuseum = !!this.sight.sets && this.sight.sets[0] === 'mus';

    if (this.isMuseum) {
      this.typeText = 'Государственный музей';
    } else {
      this.typeText = this.sight.type ? OKN_TYPES[this.sight.type[0]].full : '';
      this.categoryText = this.sight.category
        ? OKN_CATEGORIES[this.sight.category[0]].full
        : '';
    }

    // TODO load sight data by this.sight.post_id or query param...
  }

  public onClose(): void {
    this.closeCard.emit();
  }
}
