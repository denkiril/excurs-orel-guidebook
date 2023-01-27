import { Directive, HostListener } from '@angular/core';
import { TooltipService } from '../services/tooltip.service';

@Directive({
  selector: '[exogbTooltip]',
})
export class TooltipDirective {
  private isShowed = false;

  constructor(private readonly tooltipService: TooltipService) {}

  @HostListener('mouseover', ['$event']) onMouseOver(event: MouseEvent): void {
    if (this.isShowed) return;

    console.log('onMouseOver', event);
    this.showTooltip(true);
  }

  @HostListener('mouseleave') onMouseLeave(): void {
    console.log('onMouseLeave');
    this.showTooltip(false);
  }

  private showTooltip(value: boolean): void {
    this.isShowed = value;
    this.tooltipService.showTooltip(value);
  }
}
