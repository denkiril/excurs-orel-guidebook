import { Component, OnInit, ɵmarkDirty as markDirty } from '@angular/core';
import { TooltipService } from '../../services/tooltip.service';

@Component({
  selector: 'exogb-cover',
  templateUrl: './cover.component.html',
  styleUrls: ['./cover.component.scss'],
})
export class CoverComponent implements OnInit {
  showTooltip = false;

  constructor(private readonly tooltipService: TooltipService) {}

  ngOnInit(): void {
    this.tooltipService.showTooltip$.subscribe((value) => {
      this.showTooltip = value;
      markDirty(this);
    });
  }
}
