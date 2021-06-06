import { Component, HostListener, OnInit, ɵmarkDirty as markDirty } from '@angular/core';

@Component({
  selector: 'exo-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss']
})
export class MainMenuComponent implements OnInit {
  opened = false;

  constructor() {}

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  ngOnInit(): void {}

  @HostListener('click')
  onClick(): void {
    this.opened = !this.opened;
    markDirty(this);

    console.log('opened:', this.opened);
  }
}
