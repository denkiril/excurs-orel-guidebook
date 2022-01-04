import {
  Component,
  EventEmitter,
  Input,
  // OnChanges,
  Output,
  // SimpleChanges,
} from '@angular/core';
import { SightForMoreData } from 'src/app/services/sights.service';

@Component({
  selector: 'exogb-second-panel',
  templateUrl: './second-panel.component.html',
  styleUrls: ['./second-panel.component.scss'],
})
export class SecondPanelComponent {
  @Input() sightForMore?: SightForMoreData;
  @Output() closePanel = new EventEmitter<void>();

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log('|| ngOnChanges:', changes);
  //   console.log('|| sightForMore:', this.sightForMore);
  // }

  onClose(): void {
    this.closePanel.emit();
  }
}
