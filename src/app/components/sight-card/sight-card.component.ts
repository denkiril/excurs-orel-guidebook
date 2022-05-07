import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  SightData,
  OknText,
  OKN_TYPES,
  OKN_CATEGORIES,
} from 'src/app/services/sights.service';

@Component({
  selector: 'exogb-sight-card',
  templateUrl: './sight-card.component.html',
  styleUrls: ['./sight-card.component.scss'],
})
export class SightCardComponent implements OnInit {
  @Input() sight!: SightData;
  @Input() index = 0;
  @Output() clickMore = new EventEmitter<SightData>();

  descriptionShort = '';
  descriptionFull = '';
  isMuseum = false;

  // constructor() { }

  ngOnInit(): void {
    this.isMuseum = !!this.sight.sets && this.sight.sets[0] === 'mus';

    if (this.isMuseum) {
      this.descriptionShort = 'Государственный музей';
      this.descriptionFull = 'Государственный музей';
    } else {
      const description = this.getOknText(this.sight);
      this.descriptionShort = description.short;
      this.descriptionFull = description.full;
    }
  }

  private getOknText(sight: SightData): OknText {
    const typeText: OknText | undefined = sight.okn_type
      ? OKN_TYPES[sight.okn_type[0]]
      : undefined;
    const categoryText: OknText | undefined = sight.okn_category
      ? OKN_CATEGORIES[sight.okn_category[0]]
      : undefined;

    let short = typeText?.short || '';
    if (short && categoryText?.short) short += ` ${categoryText.short}`;

    let full = typeText?.full || '';
    if (full && categoryText?.full) full += ` ${categoryText.full}`;

    return { short, full };
  }

  public onClickMore(sight: SightData): void {
    this.clickMore.emit(sight);
  }
}
