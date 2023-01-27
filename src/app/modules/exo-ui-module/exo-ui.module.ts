import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TooltipDirective } from './directives/tooltip.directive';
import { CoverComponent } from './root/cover/cover.component';
import { TooltipComponent } from './tooltip/tooltip.component';

@NgModule({
  declarations: [TooltipDirective, TooltipComponent, CoverComponent],
  imports: [CommonModule],
})
export class ExoUiModule {}
