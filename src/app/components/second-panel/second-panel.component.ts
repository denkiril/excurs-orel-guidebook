import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SightForMoreData } from 'src/app/models/sights.models';

@Component({
  selector: 'exogb-second-panel',
  templateUrl: './second-panel.component.html',
  styleUrls: ['./second-panel.component.scss'],
})
export class SecondPanelComponent {
  @Input() sightForMore?: SightForMoreData;
  @Output() closePanel = new EventEmitter<void>();

  private touchstartEvent?: TouchEvent;

  onClose(): void {
    this.closePanel.emit();
  }

  onTouchstart(touchstartEvent: TouchEvent): void {
    this.touchstartEvent = touchstartEvent;
  }

  onTouchend(touchendEvent: TouchEvent): void {
    if (!this.touchstartEvent) return;

    const endTouch = touchendEvent.changedTouches[0];
    const startTouch = this.touchstartEvent.changedTouches[0];

    if (
      endTouch.pageX - startTouch.pageX < -100 &&
      Math.abs(endTouch.pageY - startTouch.pageY) < 50 &&
      touchendEvent.timeStamp - this.touchstartEvent.timeStamp < 500
    ) {
      this.onClose();
    }
  }
}
