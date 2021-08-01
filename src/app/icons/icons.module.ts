import { NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

import expand_less from '!!raw-loader!./svg/expand_less.svg';
import expand_more from '!!raw-loader!./svg/expand_more.svg';
import open_in_new from '!!raw-loader!./svg/open_in_new.svg';
import search from '!!raw-loader!./svg/search.svg';
import close from '!!raw-loader!./svg/close.svg';
import chevron_right from '!!raw-loader!./svg/chevron_right.svg';

@NgModule({
  declarations: [],
  imports: [
    MatIconModule, //
  ],
  exports: [
    MatIconModule, //
  ],
})
export class IconsModule {
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry
      .addSvgIconLiteral(
        'expand_less',
        sanitizer.bypassSecurityTrustHtml(expand_less),
      )
      .addSvgIconLiteral(
        'expand_more',
        sanitizer.bypassSecurityTrustHtml(expand_more),
      )
      .addSvgIconLiteral(
        'open_in_new',
        sanitizer.bypassSecurityTrustHtml(open_in_new),
      )
      .addSvgIconLiteral('search', sanitizer.bypassSecurityTrustHtml(search))
      .addSvgIconLiteral('close', sanitizer.bypassSecurityTrustHtml(close))
      .addSvgIconLiteral(
        'chevron_right',
        sanitizer.bypassSecurityTrustHtml(chevron_right),
      );
  }
}
