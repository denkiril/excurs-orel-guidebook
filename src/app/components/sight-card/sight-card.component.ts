import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  OnInit,
} from '@angular/core';

import { SightData, OknText, SightType } from 'src/app/models/sights.models';
import { OKN_TYPES, OKN_CATEGORIES } from 'src/app/models/sights.constants';

@Component({
  selector: 'exogb-sight-card',
  templateUrl: './sight-card.component.html',
  styleUrls: ['./sight-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SightCardComponent implements OnInit {
  @HostBinding('class.active') get isActive(): boolean {
    return this.active;
  }

  @Input() sight!: SightData;
  @Input() index = 0;
  @Input() active = false;

  descriptionShort = '';
  descriptionFull = '';
  isMuseum = false;
  nestedItems: SightData[] = [];

  ngOnInit(): void {
    this.isMuseum = !!this.sight.sets && this.sight.sets[0] === 'mus';
    this.nestedItems =
      this.sight.nested?.filter(({ type }) => type === SightType.DEFAULT) ?? [];

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
}
