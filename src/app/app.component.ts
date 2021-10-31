import {
  Component,
  HostListener,
  OnInit,
  ɵmarkDirty as markDirty,
} from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { UtilitiesService } from './services/utilities.service';
import { WindowService } from './services/window.service';
import { MOBILE_SCREEN_WIDTH } from './core/constants';

@Component({
  selector: 'exogb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('expandPanel', [
      state(
        'default',
        style({
          transform: 'translateY(0)',
        }),
      ),
      state(
        'expanded',
        style({
          transform: 'translateY(calc(80px - 100%))',
        }),
      ),
      transition('default <=> expanded', [animate('400ms ease-out')]),
    ]),
  ],
})
export class AppComponent implements OnInit {
  private expanded = false;
  public canExpandPanel = false;
  public expandPanelState: 'default' | 'expanded' | '' = 'default';

  constructor(
    private utilitiesService: UtilitiesService,
    private windowService: WindowService,
  ) {}

  ngOnInit(): void {
    this.checkExpandPanelAbility();
  }

  @HostListener('document:click', ['$event'])
  documentClick(event: any): void {
    console.log('AppComponent document click');
    this.utilitiesService.documentClickedTarget.next(event.target);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkExpandPanelAbility();
  }

  private checkExpandPanelAbility(): void {
    const canExpandPanelPrev = this.canExpandPanel;
    this.canExpandPanel =
      this.windowService.windowRef.innerWidth <= MOBILE_SCREEN_WIDTH;

    if (!this.canExpandPanel) {
      this.expanded = false;
      this.expandPanelState = '';
    } else if (!canExpandPanelPrev) {
      this.expandPanelState = 'default';
    }
    markDirty(this);
  }

  public toggleExpandPanel(): void {
    if (!this.canExpandPanel) return;

    this.expanded = !this.expanded;
    this.expandPanelState = this.expanded ? 'expanded' : 'default';
    markDirty(this);
  }
}
