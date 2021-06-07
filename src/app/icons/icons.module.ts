import { NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';

import expandLess from '!!raw-loader!./svg/expand_less.svg';
import expandMore from '!!raw-loader!./svg/expand_more.svg';

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
      .addSvgIconLiteral('expand_less', sanitizer.bypassSecurityTrustHtml(expandLess))
      .addSvgIconLiteral('expand_more', sanitizer.bypassSecurityTrustHtml(expandMore));
  }
}
